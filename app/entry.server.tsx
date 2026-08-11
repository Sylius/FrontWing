/**
 * By default, React Router will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx react-router reveal` ✨
 * For more information, see https://reactrouter.com/explanation/special-files#entryservertsx
 */

import { PassThrough } from "node:stream";
import dotenv from "dotenv";
dotenv.config();

import type { EntryContext, RouterContextProvider } from "react-router";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import type { i18n } from "i18next";

import { fetchChannel } from "~/api/channel.server";
import { createI18nInstance, resolveLocale } from "~/i18n.server";
import { createLocaleMapper } from "~/utils/locale";
import { collectNamespaces } from "~/i18n";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    loadContext: RouterContextProvider
) {
  const channel = await fetchChannel();
  const mapper = createLocaleMapper(channel.locales);
  const { urlLocale } = resolveLocale(request, channel);

  const namespaces = collectNamespaces(routerContext.staticHandlerContext.matches);

  const { instance } = await createI18nInstance({
    lng: urlLocale,
    supportedLngs: mapper.urlSegments,
    fallbackLng: mapper.toUrl(channel.defaultLocale),
    namespaces,
  });

  const readyEvent = isbot(request.headers.get("user-agent") || "")
      ? "onAllReady"
      : "onShellReady";

  return renderToStream(request, responseStatusCode, responseHeaders, routerContext, instance, readyEvent);
}

function renderToStream(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    i18nInstance: i18n,
    readyEvent: "onAllReady" | "onShellReady"
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let status = responseStatusCode;

    const { pipe, abort } = renderToPipeableStream(
        <I18nextProvider i18n={i18nInstance}>
          <ServerRouter context={routerContext} url={request.url} />
        </I18nextProvider>,
        {
          [readyEvent]() {
            shellRendered = true;
            const body = new PassThrough();
            const stream = createReadableStreamFromReadable(body);

            responseHeaders.set("Content-Type", "text/html");

            resolve(
                new Response(stream, {
                  headers: responseHeaders,
                  status,
                })
            );

            pipe(body);
          },
          onShellError(error: unknown) {
            reject(error);
          },
          onError(error: unknown) {
            status = 500;
            if (shellRendered) {
              console.error(error);
            }
          },
        }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
