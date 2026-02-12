import type { Rule } from "eslint";

const RESPONSE_ACTION_IDENTIFIERS = new Set([
  "responseActions",
  "onResponseAction",
  "onBeforeResponseAction",
]);

function jsxNameToString(
  name:
    | {
        type: "JSXIdentifier";
        name: string;
      }
    | {
        type: "JSXMemberExpression";
        object: unknown;
        property: unknown;
      }
    | {
        type: "JSXNamespacedName";
      },
): string {
  if (name.type === "JSXIdentifier") {
    return name.name;
  }

  if (name.type === "JSXMemberExpression") {
    const object =
      name.object &&
      typeof name.object === "object" &&
      "name" in (name.object as Record<string, unknown>)
        ? String((name.object as Record<string, unknown>).name)
        : "";
    const property =
      name.property &&
      typeof name.property === "object" &&
      "name" in (name.property as Record<string, unknown>)
        ? String((name.property as Record<string, unknown>).name)
        : "";
    return `${object}.${property}`;
  }

  return "";
}

const noEmbeddedResponseActionsRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow legacy embedded response action props on display component surfaces.",
      recommended: true,
      url: "https://tool-ui.com/docs/local-actions",
    },
    schema: [],
    messages: {
      forbidden:
        "Embedded '{{name}}' is deprecated. Use sibling LocalActions or DecisionActions surfaces instead.",
    },
  },
  create(context) {
    return {
      Identifier(node) {
        if (RESPONSE_ACTION_IDENTIFIERS.has(node.name)) {
          context.report({
            node,
            messageId: "forbidden",
            data: { name: node.name },
          });
        }
      },
    };
  },
};

const noAddResultInLocalActionsRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow addResult(...) calls inside LocalActions onAction handlers.",
      recommended: true,
      url: "https://tool-ui.com/docs/local-actions",
    },
    schema: [],
    messages: {
      forbidden:
        "LocalActions onAction handlers must not call addResult(...). Use DecisionActions for consequential commits.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "onAction") return;
        const openingElement = node.parent;
        if (
          !openingElement ||
          openingElement.type !== "JSXOpeningElement" ||
          jsxNameToString(openingElement.name) !== "LocalActions"
        ) {
          return;
        }

        if (
          !node.value ||
          node.value.type !== "JSXExpressionContainer" ||
          !node.value.expression ||
          (node.value.expression.type !== "ArrowFunctionExpression" &&
            node.value.expression.type !== "FunctionExpression")
        ) {
          return;
        }

        const expressionText = sourceCode.getText(node.value.expression);
        if (/\baddResult\s*\(/.test(expressionText)) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
};

const decisionActionsRequireEnvelopeRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require DecisionActions onAction to return a createDecisionResult(...) envelope.",
      recommended: true,
      url: "https://tool-ui.com/docs/local-actions",
    },
    schema: [],
    messages: {
      envelope:
        "DecisionActions onAction must create a typed envelope with createDecisionResult(...).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "onAction") return;
        const openingElement = node.parent;
        if (
          !openingElement ||
          openingElement.type !== "JSXOpeningElement" ||
          jsxNameToString(openingElement.name) !== "DecisionActions"
        ) {
          return;
        }

        if (
          !node.value ||
          node.value.type !== "JSXExpressionContainer" ||
          !node.value.expression ||
          (node.value.expression.type !== "ArrowFunctionExpression" &&
            node.value.expression.type !== "FunctionExpression")
        ) {
          return;
        }

        const expressionText = sourceCode.getText(node.value.expression);
        if (!/\bcreateDecisionResult\s*\(/.test(expressionText)) {
          context.report({ node, messageId: "envelope" });
        }
      },
    };
  },
};

export const toolUiActionModelPlugin = {
  rules: {
    "no-embedded-response-actions": noEmbeddedResponseActionsRule,
    "no-add-result-in-local-actions": noAddResultInLocalActionsRule,
    "decision-actions-require-envelope": decisionActionsRequireEnvelopeRule,
  },
};
