import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Load the results view to highlight the selected recipe
    resultsView.update(model.getSearchResultsPage());

    //1) Update the bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2) Loading recipe
    await model.loadRecipe(id);

    //3) Rendering the recipe
    recipeView.render(model.state.recipe);



  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
}

const controlSearch = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get Search Query 
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render the search results
    //console.log(model.state.search.results);
    //default page 1
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination pages
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
}
//controlSearch();
const paginationControl = async function (goToPage) {
  // 1) Render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination pages
  paginationView.render(model.state.search);
}

const controlServings = function (newServing) {
  //1) update the recipe serving in state
  model.updateServings(newServing);

  //2) Rendering the recipe
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {

  //1) Add or delete a bookmark
  if (!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);
  else
    model.deleteBookmark(model.state.recipe.id);

  //2) Update recipe view 
  recipeView.update(model.state.recipe);

  //3) Render the bookmarks view
  bookmarksView.render(model.state.bookmarks);

}

const controlBookmarks = function () {
  //1) Render the bookmarks view at the start up of the app
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    //1)Upload the new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //2)Render recipe
    recipeView.render(model.state.recipe);

    //3)Success Message
    addRecipeView.renderMessage();

    //4)Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //5)Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    //6)Close form window
    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("🛑", err);
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearch);
  paginationView.addHandlerClick(paginationControl);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();

