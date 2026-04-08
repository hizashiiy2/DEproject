const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (major >= 24) {
  console.error(`
${"\x1b[1m\x1b[31m"}next dev is broken on Node.js ${process.version}${"\x1b[0m"}

Next.js starts, prints "Ready", then the ${"\x1b[1m"}forked dev-server child exits${"\x1b[0m"} and your shell returns with nothing on port 3001.
That matches ${"\x1b[1m"}Node 24 + child_process/fork${"\x1b[0m"} issues. Use ${"\x1b[1m"}Node 22${"\x1b[0m"} for this repo (see ${"\x1b[36m"}.nvmrc${"\x1b[0m"}).

${"\x1b[1m"}You don’t need nvm or fnm pre-installed.${"\x1b[0m"} Pick one path:

${"\x1b[1m"}1) fnm — install script (works on Arch, no AUR)${"\x1b[0m"}
   ${"\x1b[36m"}curl -fsSL https://fnm.vercel.app/install | bash${"\x1b[0m"}
   Close and reopen the terminal, then:
   ${"\x1b[36m"}fnm install 22 && fnm use 22 && node -v${"\x1b[0m"}
   (add fnm to your shell: the installer prints what to append to ~/.bashrc or ~/.zshrc)

${"\x1b[1m"}2) mise — version manager (one installer)${"\x1b[0m"}
   ${"\x1b[36m"}curl https://mise.run | sh${"\x1b[0m"}
   Restart the shell, then:
   ${"\x1b[36m"}mise install node@22 && mise use -g node@22 && node -v${"\x1b[0m"}

${"\x1b[1m"}3) Docker — Node 22 in a container (if you have Docker)${"\x1b[0m"}
   ${"\x1b[36m"}npm run dev:docker${"\x1b[0m"}

${"\x1b[1m"}4) Arch — helpers from AUR (if you use yay/paru)${"\x1b[0m"}
   ${"\x1b[36m"}yay -S fnm-bin${"\x1b[0m"}  or  ${"\x1b[36m"}yay -S nvm${"\x1b[0m"}
   Then use fnm/nvm as usual to install/use Node 22.

${"\x1b[1m"}5) Official binary (no version manager)${"\x1b[0m"}
   Download Linux x64 from ${"\x1b[36m"}https://nodejs.org/dist/latest-v22.x/${"\x1b[0m"}, unpack,
   and put its ${"\x1b[36m"}bin/${"\x1b[0m"} directory first in PATH for this project.

Then run ${"\x1b[36m"}npm run dev${"\x1b[0m"} again.

${"\x1b[2m"}Still on Node 24 only? ${"\x1b[36m"}npm run dev:any${"\x1b[2m"} (often still exits.)${"\x1b[0m"}
`);
  process.exit(1);
}
