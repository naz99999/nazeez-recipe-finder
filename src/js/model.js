import { API_URL, RESULTS_PER_PAGE, API_KEY } from "./config";
import { async } from 'regenerator-runtime';
import { getJSON, sendJSON } from "./helper.js";

export const state = {
    recipe: {},
    search: {
        query: "",
        results: [],
        page: 1,
        resultsPerPage: RESULTS_PER_PAGE,
    },
    bookmarks: [],
};

function getRecipeObject(data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        servings: recipe.servings,
        sourceUrl: recipe.source_url,
        ingredients: recipe.ingredients,
        image: recipe.image_url,
        cookingTime: recipe.cooking_time,
        sourceUrl: recipe.source_url,
        ...(recipe.key && { key: recipe.key }),
    };
}

export const loadRecipe = async function (id) {
    try {
        //1) Loading the recipe
        console.log(state.bookmarks);
        const data = await getJSON(`${API_URL}${id}?key=${API_KEY}`);

        state.recipe = getRecipeObject(data);

        //set recipe bookmarked to true when loading the recipe again
        //2 methods using some or using forEach
        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;

        //ForEach way
        // state.bookmarks.forEach(bookmark => {
        //     if (bookmark.id === id)
        //         state.recipe.bookmarked = true;
        //     else
        //         state.recipe.bookmarked = false;
        // });

    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.recipe.query = query;

        const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`);

        state.search.results = data.data.recipes.map(recipes => {
            return {
                id: recipes.id,
                title: recipes.title,
                publisher: recipes.publisher,
                image: recipes.image_url,
                ...(recipes.key && { key: recipes.key }),
            };
        });
        //console.log(state.search.results);

        //Setting the page to 1 if a new results page is loaded
        state.search.page = 1;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
}

export const updateServings = function (newServing) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * (newServing / state.recipe.servings);
        //newQt = oldQt * (newServing / oldServing) // 2 * 8 / 4 = 4
    });

    state.recipe.servings = newServing;
}


//add and delete bookmark in one
// export const addBookmark2 = function (recipe) {
//     console.log(recipe);
//     if (state.recipe.bookmarked === true) {
//         state.bookmarks.pop(recipe);
//         state.recipe.bookmarked = false;
//         console.log("1");
//     } else {
//         state.bookmarks.push(recipe);
//         state.recipe.bookmarked = true;
//         console.log("2");
//     }
// }

const persistBookmarks = function () {
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe);

    //Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    //store bookmarks in local storage
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
    state.bookmarks.splice(index, 1);

    //delete current recipe as bookmark
    if (id === state.recipe.id) {
        state.recipe.bookmarked = false;
    }
    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem("bookmarks");
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();

const clearBookmarks = function () {
    localStorage.clear("bookmarks");
}
//clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
            .map(ing => {
                const ingArr = ing[1].split(",").map(ing => ing.trim());
                if (ingArr.length !== 3)
                    throw new Error("Wrong Ingredient format! Please use the correct format!");

                const [quantity, unit, description] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, description };
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await sendJSON(`${API_URL}?key=${API_KEY}`, recipe);

        //converting the response recipe to model.js readable object
        state.recipe = getRecipeObject(data);

        //bookmarking the recipe automatically
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
}