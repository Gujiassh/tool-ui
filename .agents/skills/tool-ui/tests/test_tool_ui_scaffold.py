import subprocess
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = SKILL_ROOT / "scripts" / "tool_ui_scaffold.py"


class ToolUiScaffoldScriptTests(unittest.TestCase):
    def run_script(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), *args],
            cwd=SKILL_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_backend_plan_scaffold(self):
        result = self.run_script("--mode", "assistant-backend", "--component", "plan")
        self.assertEqual(result.returncode, 0)
        self.assertIn("createResultToolRenderer", result.stdout)
        self.assertIn("safeParseSerializablePlan", result.stdout)

    def test_backend_imports_from_schema_entrypoint(self):
        result = self.run_script("--mode", "assistant-backend", "--component", "plan")
        self.assertEqual(result.returncode, 0)
        self.assertIn('from "@/components/tool-ui/plan/schema"', result.stdout)

    def test_backend_with_actions_scaffold(self):
        result = self.run_script(
            "--mode", "assistant-backend", "--component", "data-table", "--with-actions"
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("ToolUI", result.stdout)
        self.assertIn("ToolUI.LocalActions", result.stdout)
        self.assertIn("ToolUI.Surface", result.stdout)

    def test_backend_without_actions_omits_toolui(self):
        result = self.run_script(
            "--mode", "assistant-backend", "--component", "data-table"
        )
        self.assertEqual(result.returncode, 0)
        self.assertNotIn("ToolUI.LocalActions", result.stdout)

    def test_backend_weather_scaffold_uses_weather_parser(self):
        result = self.run_script(
            "--mode",
            "assistant-backend",
            "--component",
            "weather-widget",
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("safeParseWeatherWidgetPayload", result.stdout)

    def test_frontend_action_centric_uses_direct_wiring(self):
        result = self.run_script(
            "--mode", "assistant-frontend", "--component", "option-list"
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("onAction", result.stdout)
        self.assertIn("idPrefix", result.stdout)
        self.assertNotIn("ToolUI.DecisionActions", result.stdout)

    def test_frontend_standard_uses_decision_actions(self):
        result = self.run_script(
            "--mode", "assistant-frontend", "--component", "order-summary"
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("ToolUI.DecisionActions", result.stdout)
        self.assertIn("createDecisionResult", result.stdout)
        self.assertIn("onCommit", result.stdout)
        self.assertIn("idPrefix", result.stdout)

    def test_frontend_imports_from_schema_entrypoint(self):
        result = self.run_script(
            "--mode", "assistant-frontend", "--component", "order-summary"
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn('from "@/components/tool-ui/order-summary/schema"', result.stdout)

    def test_manual_imports_from_schema_entrypoint(self):
        result = self.run_script("--mode", "manual", "--component", "plan")
        self.assertEqual(result.returncode, 0)
        self.assertIn('from "@/components/tool-ui/plan/schema"', result.stdout)

    def test_invalid_component_fails(self):
        result = self.run_script(
            "--mode",
            "assistant-backend",
            "--component",
            "nope",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown component id", result.stdout)


if __name__ == "__main__":
    unittest.main()
