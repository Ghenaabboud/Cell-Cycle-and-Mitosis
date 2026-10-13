# Cell Cycle and Mitosis – student page and teacher panel

EISM Science · Year 11 Biology · Unit 2: Cell Division and Reproduction

| File | What it is | Who uses it |
|---|---|---|
| `index.html` | The student page. Students type their name and class, then work through the steps and checkpoints. | Students |
| `teacher.html` | Your teacher panel. It shows every student's steps, checkpoint scores and the questions they got wrong. It opens only with your passcode. | You |
| `apps-script/Code.gs` | The code that saves progress into **your** Google Sheet. It goes into Google Apps Script, **not** GitHub. | Google |

Student progress is stored in a Google Sheet in your own Google account. Nothing about students is stored on GitHub.

---

## Step 1 · Make the Google Sheet (5 minutes)

1. Sign in to Google with your **school** account and create a new Google Sheet. Name it *Cell Cycle and Mitosis – Progress*.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete everything in `Code.gs`, then paste in the whole of `apps-script/Code.gs` from this folder.
4. On the line `const TEACHER_PASSCODE = 'CHANGE-ME';`, replace `CHANGE-ME` with your own passcode. Keep it secret.
5. Click **Save** (the disk icon).

## Step 2 · Deploy the script

1. Click **Deploy → New deployment**.
2. Click the gear next to *Select type* and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**. Students do not need Google accounts.
   - If you only see *Anyone within [your school]*, your school's Google settings block public access. In that case, students must be signed in to their school Google account in the same browser, or their progress will not save. Ask IT to allow it, or test with a student account first.
4. Click **Deploy**, then **Authorize access** and allow it. Google may show an "unverified app" warning because you wrote the script yourself. Click *Advanced → Go to … (unsafe)* to continue.
5. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`.

## Step 3 · Connect the student page

1. Open `index.html` in a text editor. On GitHub you can do this in the browser with the pencil icon.
2. Search for `PASTE_YOUR_APPS_SCRIPT_URL_HERE` and replace it with your Web app URL. Keep the quotes.
3. Optional: in `teacher.html`, paste the same URL into `const DEFAULT_ENDPOINT = '';` so you only need to type your passcode.

## Step 4 · Put it on GitHub Pages

1. On github.com, create a new repository, for example `cell-cycle-mitosis`. It can be **Public**: it contains no student data or passcode.
2. Upload `index.html` and `teacher.html`. The copy of `apps-script/Code.gs` in this repository is safe to keep here because it has no passcode. **Never** put your real passcode in the GitHub copy.
3. Go to **Settings → Pages**. Under *Branch*, choose `main` and `/ (root)`, then **Save**.
4. After about a minute, your links will be:
   - Students: `https://YOUR-USERNAME.github.io/cell-cycle-mitosis/`
   - You: `https://YOUR-USERNAME.github.io/cell-cycle-mitosis/teacher.html`

## Step 5 · Test it before the lesson

1. Open the student link, sign in as a test student, and finish a checkpoint. The top of the page should say **Saved ✓**.
2. Open the teacher link, enter your passcode, and check that the test student appears.
3. Delete the test student's row in the **Progress** tab of your Google Sheet.

---

## Good to know

- **Where the data is:** the *Progress* tab has one row per student. The *Activity log* tab has a row for every action, with the time. You can sort, filter or download the sheet like any Google Sheet.
- **Who can see it:** only people with access to your Google Sheet, and anyone who knows your passcode on the teacher panel.
- **Changing the passcode:** edit it in Apps Script, then **Deploy → Manage deployments → Edit → New version → Deploy**. The URL stays the same.
- **If you edit `Code.gs` later:** you must deploy a new version (as above) before the change takes effect.
- **Shared devices:** if a different student signs in on the same device, the page starts a fresh record for them. "Not you?" at the top of the page switches student.
- **Spelling:** each name and class is saved exactly as typed. Ask students to use their full real name and class, for example *11B*.
- **New class next year:** make a copy of the Google Sheet (the script is copied with it) and deploy again.
