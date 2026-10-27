import { delay, HttpResponse } from "msw";
import { ZodError } from "zod";
import { db, MockError } from "../database";

export function endpoint(
  action: (
    request: Request,
    params: Record<string, string | readonly string[] | undefined>,
  ) => unknown | Promise<unknown>,
) {
  return async ({
    request,
    params,
  }: {
    request: Request;
    params: Record<string, string | readonly string[] | undefined>;
  }) => {
    try {
      const path = new URL(request.url).pathname;
      const scenario = db.demo.scenario;

      if (!path.includes("/__demo")) {
        await delay(
          scenario === "slow"
            ? 1800
            : scenario === "out-of-order"
              ? new URL(request.url).searchParams.get("q")?.length === 1
                ? 1200
                : 80
              : db.demo.latency,
        );

        if (scenario === "offline") return HttpResponse.error();

        if (scenario === "forbidden" && path === "/api/profile")
          throw new MockError(
            "Você não tem permissão para acessar este recurso.",
            403,
            "FORBIDDEN",
          );

        if (scenario === "server-error" && path === "/api/nfts")
          throw new MockError(
            "Serviço temporariamente indisponível.",
            503,
            "TRANSIENT",
          );

        if (
          scenario === "favorite-error" &&
          request.method === "PUT" &&
          path.includes("/favorites/")
        )
          throw new MockError(
            "Não foi possível salvar o favorito.",
            503,
            "TRANSIENT",
          );
      }

      const result = await action(request, params);

      return result instanceof Response
        ? result
        : HttpResponse.json(result === undefined ? {} : result);
    } catch (error) {
      if (error instanceof MockError)
        return HttpResponse.json(
          { message: error.message, code: error.code, fields: error.fields },
          { status: error.status },
        );

      if (error instanceof ZodError)
        return HttpResponse.json(
          {
            message: "Confira os campos destacados.",
            code: "VALIDATION",
            fields: Object.fromEntries(
              error.issues.map((i) => [i.path.join("."), i.message]),
            ),
          },
          { status: 422 },
        );

      console.error(error);

      return HttpResponse.json(
        { message: "Falha inesperada na simulação.", code: "INTERNAL" },
        { status: 500 },
      );
    }
  };
}
