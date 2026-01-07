export function goTo(key) {
  const routes = {
    landing: "/landing",
    test: "/test",
    quiz: "/quiz",
    result: "/result",
    twibbon: "/twibbon",
  };
  window.location.href = routes[key];
}
