const userInput = document.getElementById("username");
const searchBtn = document.getElementById("search");
const infoDiv = document.getElementById("info");

searchBtn.addEventListener("click", () => {
  getUserInfo(userInput.value);
});

let latestSearch = 0;

async function getUserInfo(user) {
  const searchId = ++latestSearch;
  const username = user.trim();

  if (!username) {
    infoDiv.textContent = "Enter a GitHub username";
    return;
  }

  const url = `https://api.github.com/users/${encodeURIComponent(username)}`;

  infoDiv.textContent = "Loading...";

  try {
    const [response, reposResponse] = await Promise.all([
      fetch(url),
      fetch(`${url}/repos?per_page=5`),
    ]);

    if (response.status === 404) {
      throw new Error("User not found");
    }

    if (!response.ok) {
      throw new Error(`HTTP: ${response.status}`);
    }

    if (!reposResponse.ok) {
      throw new Error(`Repositories HTTP: ${reposResponse.status}`);
    }

    const [userData, repos] = await Promise.all([response.json(), reposResponse.json()]);
    if (searchId !== latestSearch) return;

    // RENDER PROFILE
    const profile = document.createElement("div");
    profile.classList = "profile";

    const avatar = document.createElement("img");
    avatar.src = userData.avatar_url;
    avatar.alt = "GitHub avatar";
    avatar.classList = "avatar";
    avatar.width = 100;
    avatar.height = 100;

    const login = document.createElement("p");
    login.textContent = `@${userData.login}`;
    login.classList = "login";

    const name = document.createElement("h2");
    name.textContent = userData.name || userData.login;

    const bio = document.createElement("p");
    bio.textContent = userData.bio || "User has no bio.";

    const publicRepos = document.createElement("p");
    publicRepos.innerHTML = `${userData.public_repos}<span>Repositories</span>`;
    publicRepos.classList = "label";

    const followers = document.createElement("p");
    followers.innerHTML = `${userData.followers}<span>Followers</span>`;
    followers.classList = "label";

    const profileLink = document.createElement("a");
    profileLink.href = userData.html_url;
    profileLink.target = "_blank";
    profileLink.rel = "noopener noreferrer";
    profileLink.innerHTML = `View GitHub Profile <span aria-hidden="true">↗</span>`;
    profileLink.classList = "link";

    profile.append(
      avatar,
      name,
      login,
      bio,
      publicRepos,
      followers,
      profileLink,
    );

    // RENDER REPOSITORIES
    const reposSection = document.createElement("section");

    const reposHeading = document.createElement("h2");
    reposHeading.textContent = "Repositories";

    reposSection.appendChild(reposHeading);

    if (repos.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No public repositories.";
      reposSection.appendChild(emptyMessage);
    } else {
      const reposList = document.createElement("ul");

      repos.forEach((repo) => {
        const item = document.createElement("li");

        const repoName = document.createElement("h3");
        repoName.textContent = repo.name;

        const description = document.createElement("p");
        description.textContent = repo.description || "No description";
        description.classList = "description";

        const language = document.createElement("p");
        language.innerHTML = `<span>Language</span>${repo.language || "Unknown"}`;
        language.classList = "label";

        const stars = document.createElement("p");
        stars.innerHTML = `<span>Stars</span>${repo.stargazers_count}`;
        stars.classList = "label";

        const repoLink = document.createElement("a");
        repoLink.href = repo.html_url;
        repoLink.target = "_blank";
        repoLink.rel = "noopener noreferrer";
        repoLink.textContent = "View Repository";

        item.append(repoName, description, language, stars, repoLink);

        reposList.appendChild(item);
      });

      reposSection.appendChild(reposList);
    }

    // SHOW RESULTS
    infoDiv.replaceChildren(profile, reposSection);
  } catch (error) {
    if (searchId !== latestSearch) return;
    infoDiv.textContent = error.message;
    console.error(error);
  }
}
