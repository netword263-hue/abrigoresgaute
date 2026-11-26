export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/img");

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid"
  };
}