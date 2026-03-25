export default defineConfig({
  base: "/buzz/", // GitHub Pages 的 base 路径
  plugins: [react()],
  define: {
    'process.env': {} 
  }
});