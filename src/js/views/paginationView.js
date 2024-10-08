import View from "./View";
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector(".pagination");

    addHandlerClick(handler) {
        this._parentElement.addEventListener("click", function (e) {
            const btn = e.target.closest(".btn--inline");
            if (!btn) return;

            const goToPage = Number(btn.dataset.goto);
            handler(goToPage);


        })
    }

    _generateMarkup() {
        //console.log(`data results length ${this._data.results.length}`);
        //console.log(`data resultsperpage ${this._data.resultsPerPage}`);
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        //console.log(numPages);
        const currPage = this._data.page;

        //page 1, and there are other pages
        if (currPage === 1 && numPages > 1) {
            return this._generateMarkupNextPage(currPage);
        }

        //last page
        if (currPage === numPages && numPages > 1) {
            return this._generateMarkupPrevPage(currPage);
        }
        //other page
        if (currPage < numPages) {
            return `
            ${this._generateMarkupPrevPage(currPage)}
            ${this._generateMarkupNextPage(currPage)}
            `;
        }
        //page 1, and there are NO other pages
        return "";
    }

    _generateMarkupNextPage(currPage) {
        return `
            <button data-goto="${currPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${currPage + 1}</span>
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
            `;
    }

    _generateMarkupPrevPage(currPage) {
        return `
             <button data-goto="${currPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${currPage - 1}</span>
            </button>
            `;
    }
}

export default new PaginationView();