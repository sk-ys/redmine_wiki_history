(() => {
  if (typeof jsToolBar === "undefined") return;

  class WikiHistoryClass {
    #history = [];
    #historyPos = 1;
    #monitoringTimerId;
    #monitoringInterval = 5000;

    constructor(jstBlock, undoButton, redoButton) {
      this.target = jstBlock;
      this.$textarea = $(jstBlock).find("textarea").eq(0);
      this.$undoButton = $(undoButton);
      this.$redoButton = $(redoButton);

      if (this.$textarea.length === 0) return;

      // Register initial history
      this.#appendHistory();

      // Set event to update history
      this.$textarea
        .on("keydown", (e) => {
          // target keys: [
          //   'BACKSPACE', 'COMMA', 'DELETE', 'DOWN', 'END', 'ENTER', 'ESCAPE',
          //   'HOME', 'LEFT', 'PAGE_DOWN', 'PAGE_UP', 'PERIOD', 'RIGHT',
          //   'SPACE', 'TAB', 'UP']
          // at jQueryUI v1.13.2
          const targetKeyCode = Object.values($.ui.keyCode).includes(e.keyCode);
          if (targetKeyCode) {
            this.#appendHistory();
          }
        })
        .on("change click blur paste cut", () => {
          setTimeout(this.#appendHistory);
        })
        .on("focus", () => {
          clearTimeout(this.#monitoringTimerId);
          this.#monitoring();
        });

      $(jstBlock)
        .find("div.jstElements > button")
        .on("click", () => {
          setTimeout(this.#appendHistory);
        });

      // Set event for buttons
      this.$undoButton.on("click", this.#undo);
      this.$redoButton.on("click", this.#redo);

      // Support Undo or Redo shortcut key
      this.$textarea.on("keydown", (e) => {
        // Undo
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
          e.preventDefault();
          this.#undo();
        }

        // Redo
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 89) {
          e.preventDefault();
          this.#redo();
        }
      });

      this.#updateButtonViews();
    }

    #appendHistory = () => {
      const val = this.$textarea.val();

      if (this.#history.length > 0) {
        if (
          this.#history[this.#history.length - this.#historyPos].val === val
        ) {
          return;
        }
      }

      // Remove unapplied history
      this.#history = this.#history.slice(
        0,
        this.#history.length - (this.#historyPos - 1)
      );
      this.#historyPos = 1;

      // Update history
      this.#history.push({
        val: val,
        selectionStart: this.$textarea.prop("selectionStart"),
        selectionEnd: this.$textarea.prop("selectionEnd"),
      });

      this.#updateButtonViews();
    };

    #undo = () => {
      this.#appendHistory();
      if (this.#history.length - this.#historyPos > 0) {
        this.#historyPos += 1;
        const lastHistory =
          this.#history[this.#history.length - this.#historyPos];
        this.$textarea
          .val(lastHistory.val)
          .focus()[0]
          .setSelectionRange(
            lastHistory.selectionStart,
            lastHistory.selectionEnd
          );
      } else {
        this.$textarea.focus();
      }
      this.#updateButtonViews();
    };

    #redo = () => {
      this.#appendHistory();
      if (this.#historyPos > 1) {
        this.#historyPos -= 1;
        const lastHistory =
          this.#history[this.#history.length - this.#historyPos];
        this.$textarea
          .val(lastHistory.val)
          .focus()[0]
          .setSelectionRange(
            lastHistory.selectionStart,
            lastHistory.selectionEnd
          );
      } else {
        this.$textarea.focus();
      }
      this.#updateButtonViews();
    };

    #updateButtonViews = () => {
      // For undo button
      this.$undoButton.toggleClass(
        "disabled",
        !(this.#history.length - this.#historyPos > 0)
      );

      // For redo button
      this.$redoButton.toggleClass("disabled", !(this.#historyPos > 1));
    };

    #monitoring = () => {
      this.#appendHistory();

      // If textarea is focused, continue to monitoring
      if (this.$textarea.is(":focus")) {
        clearTimeout(this.#monitoringTimerId);
        this.#monitoringTimerId = setTimeout(
          this.#monitoring,
          this.#monitoringInterval
        );
      }
    };
  }

  // Register button and functions to jsToolBar
  const undoButton = {
    type: "button",
    title: WikiHistory.config.resources.labelUndo,
    fn: {
      wiki: function () {},
    },
  };

  const redoButton = {
    type: "button",
    title: WikiHistory.config.resources.labelRedo,
    fn: {
      wiki: function () {},
    },
  };

  // This is the trigger to initialize the wiki-history feature
  const initWikiHistory = {
    type: "init_wiki_history",
  };

  // Recreate toolbar
  jsToolBar.prototype.elements = {
    undo: undoButton,
    redo: redoButton,
    init_wiki_history: initWikiHistory,
    ...jsToolBar.prototype.elements,
  };

  jsToolBar.prototype.init_wiki_history = function () {
    // Set undo icon
    const undoButton = $(this.toolbar)
      .find("button.jstb_undo")
      .append(
        $("<span/>")
          .addClass("ui-icon ui-icon-arrowreturnthick-1-w")
          .css("display", "inline-block")
      );

    // Set redo icon
    const redoButton = $(this.toolbar)
      .find("button.jstb_redo")
      .append(
        $("<span/>")
          .addClass("ui-icon ui-icon-arrowreturnthick-1-w")
          .css({ display: "inline-block", transform: "scaleX(-1)" })
      );

    new WikiHistoryClass(this.toolbarBlock, undoButton, redoButton);
  };
})();
