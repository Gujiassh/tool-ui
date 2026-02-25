# Tool UI

Copy/paste React components for rendering tool calls in AI chat interfaces. Built by [assistant-ui](https://github.com/assistant-ui).

When a model calls a tool, most apps dump raw JSON into the conversation. These components turn tool payloads into interactive UI — approvals, forms, tables, charts, media cards, and receipts — so users can understand and act without leaving the chat.

<p align="center">
  <img src="public/assets/homepage.png" alt="Tool UI – UI components for AI interfaces" width="880">
</p>

**[tool-ui.com](https://tool-ui.com)** | [Docs](https://tool-ui.com/docs/overview) | [Gallery](https://tool-ui.com/docs/gallery) | [Quick Start](https://tool-ui.com/docs/quick-start)

## Gallery

<p align="center">
  <img src="public/assets/gallery.png" alt="Tool UI component gallery – weather, message draft, code block, image gallery, order summary, chart, and plan components" width="900">
</p>

## Featured components

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Option List</strong><br>
      <em>Let users select from multiple choices</em><br>
      <img src="public/assets/option-list.png" alt="Option List component" width="400">
    </td>
    <td align="center" width="50%">
      <strong>Question Flow</strong><br>
      <em>Multi-step guided questions with branching</em><br>
      <img src="public/assets/question-flow.png" alt="Question Flow component" width="400">
    </td>
  </tr>
</table>

## Components

- **Decision/Confirmation**: Approval Card, Order Summary, Message Draft, Option List
- **Input/Configuration**: Parameter Slider, Preferences Panel, Question Flow
- **Display/Artifacts**: Data Table, Chart, Citation, Link Preview, Stats Display, Code Block, Code Diff, Terminal
- **Media/Creative**: Image, Image Gallery, Video, Audio, Instagram Post, LinkedIn Post, X Post
- **Progress/Execution**: Plan, Progress Tracker, Weather Widget

Each component includes a Zod schema for payload validation and presets for realistic example data. Browse them all in the [Gallery](https://tool-ui.com/docs/gallery).

## License

MIT License. See [LICENSE](LICENSE) for details.
