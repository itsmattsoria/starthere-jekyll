# Start Here (Jekyll)

### Getting Started
Running on [Jekyll](http://jekyllrb.com/) & [Gulp](http://gulpjs.com/)

1. Install Jekyll: `gem install jekyll`
2. Clone This Repo
3. CD to the site directory and run `bundle`
4. Install node modules: `npm install`
5. CD into the assets directory and run `bower install` to install bower dependencies
6. Run `gulp watch` to start jekyll build and fire up browsersync
7. 😎

### File Structure

```
|- /_build              // The static site gets compiled and packaged into this folder
|- /_data               // Misc yaml and other data files referenced in the site via site.data.filename
|- /_includes           // Layout partials
|- /_layouts            // Page/template layouts
|- /_plugins            // Jekyll plugins
|- /assets              // Front-end assets, everything here gets generated into the /_build folder
    |- /bower_components
    |- /images          // Images
    |- /js              // JavaScript dependencies
        |- /libs        // JS libraries to be concatenated into the site.js
        |- /no-build    // JS libraries that shouldn't be concatenated
        |- main.js      // The main application JS
    |- /scss            // Sass folder
        |- /components  // Components and pieces
        |- /helpers     // Things that assist and generally don't output CSS
        |- /pages       // Individual page/view styles
        |- /vendor      // Vendor styles for libraries etc.
        |- main.scss    // Import manifest — no actual styles declared
    |- /svgs            // SVGs go here
|- /dist                // Final compiled assets that get copied into /_build
|- config.yml           // Jekyll config settings
|- gulpfile.js          // The gulpfile is in the root and handles the /assets directory
|- package.js           // The gulp dependency manifest
|- index.md             // The landing page
|- /page-name           // Pages are organized in directories in the root by their page-name
    |- index.md         // They each get an index.md to handle the page content
    |- /child-page-name // Child pages follow the same convention
```
