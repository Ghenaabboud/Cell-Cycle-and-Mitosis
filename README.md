# Cell Cycle and Mitosis – student app and teacher panel

EISM Science · Year 11 Biology · Unit 2: Cell Division and Reproduction

## Links

- **Students:** https://ghenaabboud.github.io/Cell-Cycle-and-Mitosis/
  (this sends them to the Apps Script app; they sign in with their @eischools.ae account)
- **Meiosis simulator:** https://ghenaabboud.github.io/Cell-Cycle-and-Mitosis/meiosis.html
  (opens the Apps Script app with `?page=meiosis`; missions, quiz and exit ticket are saved to the **Meiosis** tab)
- **Teacher panel:** https://ghenaabboud.github.io/Cell-Cycle-and-Mitosis/teacher.html
  (opens only for the owner of the Apps Script)

## How it works

| File | What it is |
|---|---|
| `app.html` | The student page: name and class sign-in, the learning path, checkpoints. |
| `meiosis-app.html` | The meiosis simulator with embedded missions, quiz and exit ticket. |
| `teacher-app.html` | The teacher panel: every student's steps, checkpoint scores and the questions they got wrong. |
| `index.html`, `teacher.html` | Short pages that open the Apps Script app. |
| `apps-script/Code.gs` | The script that lives in the teacher's Google Sheet. It serves the two pages and saves progress in the Sheet. |

- Students are identified by their school Google account, so their progress follows them across devices.
- The teacher panel and the data are available only to the owner of the Google Sheet and script.
- The script loads `app.html` and `teacher-app.html` from this repository, so changes pushed here appear in the app within a minute. No redeploy needed.

## Updating the Apps Script

1. In the Google Sheet, open **Extensions → Apps Script**.
2. Replace everything in `Code.gs` with `apps-script/Code.gs` from this repository and click **Save**.
3. Click **Deploy → Manage deployments**, click the pencil icon, set **Version: New version**, and click **Deploy**. The Web app URL stays the same.
4. If Google asks for permission again, click **Authorize access** and allow it.

Deployment settings: **Execute as: Me** · **Who has access: Anyone within EISM**.

## Data

- The **Progress** tab has one row per student (school email, name, class, steps, checkpoint scores).
- The **Meiosis** tab has one row per student: stages seen, each mission, written answers, quiz and exit ticket.
- The **Activity log** tab has one row per action, with the time.
