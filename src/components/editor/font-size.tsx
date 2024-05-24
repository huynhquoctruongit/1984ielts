// import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

// export default class FontSizePlugin extends Plugin {
//   init() {
//     const editor = this.editor;

//     // Thêm command để thay đổi kích thước font.
//     editor.commands.add("fontSize", {
//       exec: (value) => {
//         editor.model.change((writer) => {
//           const selection = editor.model.document.selection;
//           if (selection) {
//             writer.setFontSize(value, selection);
//           }
//         });
//       },
//     });

//     // Thêm tùy chọn fontsize vào thanh công cụ.
//     editor.ui.componentFactory.add("fontSize", (locale) => {
//       const dropdownView = createDropdownView(locale, "Kích thước font");
//       dropdownView.panelView.children.add(createFontSizeDropdown(locale, editor));

//       dropdownView.bind("isOn").to(editor.commands.get("fontSize"), "value", (value) => value || null);

//       return dropdownView;
//     });
//   }
// }

// function createDropdownView(locale, title) {
//   const dropdownView = new DropdownView(locale);

//   dropdownView.buttonView.set({
//     label: title,
//     icon: fontSizeIcon,
//     tooltip: true,
//   });

//   return dropdownView;
// }

// function createFontSizeDropdown(locale, editor) {
//   const items = new Collection();

//   [8, 10, 12, 14, 18, 24, 36].forEach((fontSize) => {
//     const label = fontSize + "px";
//     const value = fontSize;

//     const isOn = Bind.to(editor.model.document.selection, "isInline", ({ child, range }) => child.name == "fontSize" && !range.isCollapsed);

//     items.add(createDropdownItem(locale, label, value, isOn, editor));
//   });

//   return items;
// }

// function createDropdownItem(locale, label, value, isOn, editor) {
//   const item = new ButtonView(locale);

//   item.set({
//     label,
//     withText: true,
//     tooltip: true,
//   });

//   item.on("execute", () => {
//     const command = editor.commands.get("fontSize");
//     editor.execute("fontSize", value);
//     editor.editing.view.focus();
//   });

//   item.bind("isOn").to(isOn);

//   return item;
// }
