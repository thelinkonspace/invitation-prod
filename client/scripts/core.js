export function goTo(key) {
  const routes = {
    landing: "/landing",
    quiz: "/quiz",
    result: "/result",
    twibbon: "/twibbon",
  };
  window.location.href = routes[key];
}
