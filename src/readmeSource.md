<div align="center">

# <sub><img src="https://raw.githubusercontent.com/${{ github.repository }}/refs/heads/main/assets/quests.png" height="41"></sub> Discord Quests Tracker <sub><img src="https://raw.githubusercontent.com/${{ github.repository }}/refs/heads/main/assets/quests.png" height="41"></sub>
Automatically tracking Discord Quests then sending notifications to a webhook every 5 minutes only when **a new quest is found**.

[![Node](https://img.shields.io/badge/Node-20+-blue)](https://nodejs.org/)
[![AGPL License](https://img.shields.io/badge/License-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)
</div>

> [!WARNING]
> **${{ github.repository.name }}** is a Discord Quests tracker developed solely for personal educational and monitoring purposes. To fetch current quests, this project requires your Discord user token to access Discord's internal API. Please note that using user tokens or self-bots violates Discord's Terms of Service and **may result in your account being permanently banned**. Use this software entirely at your own risk.

---

# <div align="left"><sub><img src="https://github.com/user-attachments/assets/a9877e47-cfb3-4409-8ddf-1ca8ba693ba6" height="30"></sub> Project Structure </div>
This repository uses **2 branches**:
- `main` - Source code only.
- `data` - Stores `state.json` (auto-managed by workflow).

<!-- START_METADATA_DISCORD_QUEST_TREE -->
```
The  project  structure  will  be  automatically  generated  here.
```
<!-- END_METADATA_DISCORD_QUEST_TREE -->

---

# <div align="left"><sub><img src="https://github.com/user-attachments/assets/b51a2706-7a92-4a89-b17f-6dec72cc9a21" height="30"></sub> Installation & Setup </div>
Choose one of the two deployment methods below to host your tracker:

## Method 1: Running on GitHub Actions (Cloud 24/7 & Free)
### 1. Fork and config
Go to your forked repository: **Settings** → **Secrets and variables** → **Actions**

* **In tab Secrets** (Click "**New repository secret**"):
  | Secret | Description |
  |--------|-------------|
  | `DISCORD_TOKEN` | Your Discord user token |
  | `MAIN_WEBHOOK` | URL of the main webhook for notifications |
  | `ERROR_WEBHOOK` | URL of the webhook for error logs (can be left empty) |

* **In tab Variables** (Click "**New repository variable**"):
  | Variable | Description | Value Examples |
  |----------|-------------|----------------|
  | `LOCALE` | Language display for Quest titles/information | `vi-VN`, `en-US`, `zh-CN` |
  | `PING_ROLE_ID` | The Discord Role ID you want to ping when a new quest is found | Fill with Role ID (or leave empty) |

### 2. Initialize data branch
Go to tab **Actions** → Select **"Setup data branch"** → Click **Run workflow**.

This creates the `data` orphan branch where `state.json` will be stored. **Run this once only.**

### 3. Turn on the tracker
Select **Discord Quest Tracker** workflow → Click **Run workflow** to start tracking.

## Method 2: Running on Localhost / VPS (Self-Hosted)
> [!TIP]
> To clone only the source code without the data branch, use the **Shallow Clone** command:
> ```bash
> git clone --branch main --single-branch https://github.com/${{ github.repository }}.git
> ```

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) (v20 or higher) installed. Run the following command in your terminal:
  ```bash
  npm install
  ```

### 2. Environment Configuration
Create a `.env` file in the root directory by copying the example file:
  ```bash
  cp .env.example .env
  ```
Open `.env` and fill in your credentials:
  ```env
  DISCORD_TOKEN="YOUR_DISCORD_TOKEN"                                         # Required
  MAIN_WEBHOOK="https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"   # Required
  ERROR_WEBHOOK="https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"  # Optional
  GITHUB_TOKEN="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"  # Required
  REPOSITORY="YOUR_NAME/YOUR_REPO_NAME"                    # Required
  PING_ROLE_ID=""   # Optional
  LOCALE="en-US"    # e.g., en-US, vi-VN
  STATE_DIR="./"    # Directory to store state.json (default: project root)
  ```

### 3. Start the Tracker
To execute the tracker script directly, run:
  ```bash
  node src/main.js
  ```

> [!NOTE]
> To repeat the task every 5 minutes on your local system or VPS, it is recommended to use a process manager like **PM2** or configure a system **crontab**.

---

# <div align="left"><sub><img src="https://github.com/user-attachments/assets/4724a104-d14c-4cd2-b07f-9a02c7d74a4d" height="30"></sub> How It Works? </div>
```
Every 5 minutes (via GitHub Actions loop)
                  ↓
 Pull latest state.json from data branch
                  ↓
     Fetch quests from Discord API
                  ↓
        Compare with state.json
                  ↓
 When a new quest is found → Send a notification using webhook
                           → Ping role (if configured)
                           → Save ID to state.json (atomic write)
                           → Commit & push to data branch
When no new quest is found → End quietly
```

---

# <div align="left"><sub><img src="https://github.com/user-attachments/assets/f9e9c205-a716-4a60-b3be-b2f9d58c74d9" height="30"></sub> File state.json </div>
`state.json` lives on the **`data` branch** — completely separate from `main`. This means:
- **Forking this repo** won't cause git conflicts when pushing state updates.
- Each fork has its own independent `state.json` history.

You can view it at: [${{ github.repository }}/blob/data/state.json](https://github.com/${{ github.repository }}/blob/data/state.json)
- **Reset**: Clear `sent_ids` → The bot will resend all currently active quests.
- **Delete 1 quest**: Remove a specific ID from `sent_ids` → The bot will resend only that quest.

**Safety mode:** The script writes data to `state.tmp.json` first, then renames it to `state.json`. If an error occurs while running, `state.json` remains intact and your data is safe.

---

# <div align="left"><sub><img src="https://github.com/user-attachments/assets/72f710bb-99d5-48ac-94ed-1dfe0a7a3161" height="30"></sub> Acknowledgements </div>
We would like to express our gratitude to the contributors and projects that made this possible:
- **[@HazuOkami-dev](https://github.com/HazuOkami-dev)** - Translated the README and various other contributions
- **[@kanamotokumo](https://github.com/kanamotokumo)** - Helped identify and debug the state.json issue
- **[funny-tracker](https://github.com/BachLe2000/funny-tracker)** - Inspired the creation of this project
- **[cc-plugins](https://github.com/BachLe2000/cc-plugins)** - Inspired the creation of this project

---

###### <footer><div align="center">© 2026 Mc's Team. All rights reserved.</div></footer>
