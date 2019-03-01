<script>
const Diff = require("diff");
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  methods: {
    onChange(data) {
      console.log(data);
    },
    setCaretPosition(elem, caretPos) {
      if (elem != null) {
        if (elem.createTextRange) {
          var range = elem.createTextRange();
          range.move("character", caretPos);
          range.select();
        } else {
          if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(caretPos, caretPos);
          } else elem.focus();
        }
      }
    }
  },
  data() {
    return {
      rawText: "j'aime @foo hehehe il est fou",
      diffed: undefined,
      reg: /@foo\ hehehe+/gi,
      matches: [],
      mentions: undefined,
      afterText: ""
    };
  },
  watch: {
    rawText(now, before) {
      console.log(now, before);
      const exp = /@foo\ hehehe+/gi;
      const matches = exp.exec(before);
      const matches2 = exp.exec(now);
      this.diffed = Diff.diffChars(before, now);
      if (this.diffed.length >= 5) {
        const tempDiff = [this.diffed[0], this.diffed[1], this.diffed[this.diffed.length - 1]];
        tempDiff[1].count = this.diffed.reduce( 
                            (acc, curr, i) => 
                              (i !== 0 && i === this.diffed.length-1)
                              ? acc + curr.count
                              : acc, 0
                          )
        tempDiff[1].value = this.diffed.reduce( 
                            (acc, curr, i) => 
                              (i !== 0 && i === this.diffed.length-1)
                              ? acc + curr.value
                              : acc, 0
                          )
        this.diffed = tempDiff;
      }
      let mention = matches
        ? {
            text: matches[0],
            start: matches.index,
            end: matches.index + matches[0].length,
            length: matches[0].length
          }
        : false;
      if (mention) this.mentions = mention;
      const index = this.diffed[0].count;
      const removed = this.diffed[1];
      if (
        index > mention.start &&
        index < mention.end &&
        this.diffed[1].removed &&
        matches2 === null
      ) {
        console.log("Tampered");
        if (this.diffed[1].value.length < mention.length) {
          console.log("small");
        }
        this.afterText =
          before.substr(0, mention.start) +
          before.substr(
            this.diffed[0].count + this.diffed[1].count,
            before.length
          );
        this.$nextTick(() => {
          this.rawText = this.afterText;
          console.log(this.$refs.area);
          this.setCaretPosition(this.$refs.area, mention.start);
        });
      } else if (
        index <= mention.start &&
        this.diffed[1].count + this.diffed[0].count > mention.start &&
        this.diffed[1].removed
      ) {
        console.log("left");
        this.afterText =
          this.diffed[0].value + before.substr(mention.end, before.end);
        this.$nextTick(() => {
          this.rawText = this.afterText;
          console.log(this.$refs.area);
          this.setCaretPosition(this.$refs.area, mention.start);
        });
      }

      console.log(matches, mention, now);
    }
  }
};
</script>
