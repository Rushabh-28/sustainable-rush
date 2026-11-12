# 📤 Uploading Sustainable Rush to GitHub (and putting it online)

This guide takes you from "files on my computer" to "a public repository **and** a playable website",
step by step. Pick **Method A** (no installs, easiest) or **Method B** (Git, what professionals use).
Then follow **Part 3** to publish the game as a free website with GitHub Pages.

---

## Part 0 · Before you start (2 minutes)

1. **Unzip** the project so you have a normal folder called `sustainable-rush`. Do **not** upload the `.zip` itself.
2. Open the folder. You should see `index.html`, `README.md`, and the folders `css`, `js`, `lib`, `assets`, `docs` straight away.
   If you only see *one more folder* inside, go into that folder. `index.html` must be at the **top level** of the repository.
3. Personalise it:
   * `README.md` → replace **YOUR NAME / YOUR COLLEGE / COURSE / YEAR** in the *Author* section.
   * `LICENSE` → replace **YOUR NAME** on the copyright line.
4. Test locally: double-click `index.html` (or run `python -m http.server 8000` and open `http://localhost:8000`). Play one level.
5. Create a free account at <https://github.com/signup> if you don't have one.

---

## Part 1 · Create an empty repository on GitHub

1. Log in, click the **＋** (top-right) → **New repository**.
2. Fill in:
   * **Repository name:** `sustainable-rush` (lowercase with hyphens makes a clean web address)
   * **Description:** `Eco-friendly match-3 puzzle game built with JavaScript and Phaser 3`
   * **Public** (needed for free GitHub Pages)
   * ❌ Do **not** tick *Add a README*, *.gitignore* or *license*. The project already has them, and ticking them causes merge conflicts.
3. Click **Create repository**. Keep this page open.

---

## Part 2 · Upload the files

### Method A: Drag & drop in the browser (no Git needed)

1. On the new empty repository page, click the link **“uploading an existing file”**.
2. Open your `sustainable-rush` folder, press **Ctrl + A** (select everything inside it), and **drag all of it** into the GitHub page.
   GitHub keeps the folder structure (`js/scenes/…`, `lib/…`).
3. Wait until every file shows a green tick. (A single browser upload is limited to 100 files and 25 MB per file. This project has about 20 files, the biggest is 1.2 MB.)
4. In **Commit changes** type a message such as `Add Sustainable Rush 2.0 game`, keep *Commit directly to the main branch*, click **Commit changes**.
5. Check that the repository page shows `index.html`, `css`, `js`, `lib`, … and the README text below.

> ⚠️ Files starting with a dot (like `.gitignore`) are hidden on some systems. If you can't see it, turn on
> *Show hidden files*, or just add it afterwards via **Add file → Create new file**. It is optional.

### Method B: Git on the command line (recommended)

**One-time setup**

1. Install Git: <https://git-scm.com/downloads> (Windows: accept the defaults).
2. Tell Git who you are (use the same e-mail as your GitHub account):

   ```bash
   git config --global user.name  "Your Name"
   git config --global user.email "you@example.com"
   ```

**Publish the project**: open a terminal **inside the project folder** (VS Code: *Terminal → New Terminal*):

```bash
git init                                   # turn the folder into a Git repository
git add .                                  # stage every file
git commit -m "Add Sustainable Rush 2.0 game"
git branch -M main                         # name the branch "main"
git remote add origin https://github.com/YOUR-USERNAME/sustainable-rush.git
git push -u origin main                    # upload
```

Replace `YOUR-USERNAME` with your GitHub username (copy the exact URL from the *Quick setup* box on the empty repository page).

**Logging in:** GitHub no longer accepts your account password on the command line. When asked to sign in you can either
* use the browser window that Git Credential Manager opens (easiest on Windows/macOS), or
* create a **Personal Access Token**: GitHub → *Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token*, tick **repo**, copy it, and paste it **as the password**, or
* install **GitHub Desktop** (<https://desktop.github.com>): *File → Add local repository → Publish repository*, with no commands at all.

**Updating later.** Every time you change something:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Part 3 · Turn the repository into a playable website (GitHub Pages)

1. In your repository click **Settings** (top tab row).
2. In the left sidebar choose **Pages**.
3. Under **Build and deployment → Source** select **Deploy from a branch**.
4. Under **Branch** choose **main** and folder **/ (root)**, then click **Save**.
5. Wait 1–2 minutes and refresh the page. A banner appears: **“Your site is live at …”**

   ```
   https://YOUR-USERNAME.github.io/sustainable-rush/
   ```
6. Open the link and play. 🎉
7. Put the link in your README: edit `README.md` and add under the title
   `🎮 **Play online:** https://YOUR-USERNAME.github.io/sustainable-rush/`
8. On the repository home page click the ⚙️ next to **About**, paste the website link into **Website**,
   and add **Topics** such as `game`, `phaser`, `javascript`, `match-3`, `sustainability`, `college-project`.

---

## Part 4 · Make the repository look professional

* **Screenshot:** the README already points to `docs/screenshot-game.png` and `docs/screenshot-menu.png`. If you take new ones, replace those files.
* **Clear commit messages:** `Add level 7`, `Fix hint bug` rather than `update`.
* **Pin it:** on your GitHub profile click *Customize your pins* and pin this repository.
* **Release (optional):** *Releases → Create a new release → tag `v2.0.0`* gives your submission a clean, citable version.

---

## 🛟 Troubleshooting

| Problem | Fix |
|---|---|
| Pages shows **404** | Wait 2–3 minutes; check *Settings → Pages* says “live”; make sure `index.html` is at the **root** of the repo, not inside another folder. |
| Page loads but is **blank / no game** | Open the browser console (F12). A “404” for a `.js` file means a wrong path or letter case. GitHub Pages is **case-sensitive** (`Game.js` ≠ `game.js`). Keep the exact names from this project. |
| `git push` says **rejected / non-fast-forward** | You ticked “Add README” when creating the repo. Run `git pull origin main --allow-unrelated-histories`, then `git push`. |
| `git push` asks for a password and fails | Use a Personal Access Token (see Part 2, Method B) or GitHub Desktop. |
| `remote origin already exists` | `git remote set-url origin https://github.com/YOUR-USERNAME/sustainable-rush.git` |
| Folder shows up as **a single grey arrow** on GitHub | The folder contained its own `.git` folder. Delete the inner `.git` folder and commit again. |
| Changes don't appear on the live site | Hard refresh with **Ctrl + Shift + R**. Pages can take about a minute to rebuild after each push. |
| Sound doesn't play | Browsers need a first click or tap. Press **PLAY** and it starts. |

---

### ✅ Final checklist before you submit

- [ ] `index.html` is at the top level of the repository
- [ ] Name, college and year filled in (`README.md`, `LICENSE`)
- [ ] GitHub Pages link opens and the game is playable on your phone too
- [ ] Repository is **Public** and has a description, website link and topics
- [ ] README screenshots show correctly
