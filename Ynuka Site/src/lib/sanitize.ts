import DOMPurify from "dompurify";

let hooked = false;

/**
 * Nettoie du HTML venant de la base (articles, opportunités, membres…) avant de
 * l'injecter avec dangerouslySetInnerHTML : supprime <script>, les attributs
 * on*, les liens javascript:, etc. (protection XSS).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  if (!hooked) {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node instanceof Element && node.tagName === "A" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    hooked = true;
  }
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"], FORBID_TAGS: ["style", "form", "input"] });
}
