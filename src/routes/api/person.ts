import { createServerFn } from "@tanstack/react-start";
import { getBindings } from "~/utils/bindings";

const personServerFn = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: name }) => {
    const env = getBindings();
    let growingAge = Number((await env.CACHE.get("age")) || 0);
    growingAge++;
    await env.CACHE.put("age", growingAge.toString());
    return { name, randomNumber: growingAge };
  });
