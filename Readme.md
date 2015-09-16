
### test

```sh
node test/test.js
```

#### tpl code

- input

```html
<div>
    <div q-repeat="list | getList">
        <div q-text="name" q-show="isShow" q-class="red: isRed"></div>
        <input type="text" q-value="value" />
        <input type="checkbox" q-value="value" />
        <img src="" alt="" q-src="imgSrc" />
        <img src="" alt="" q-attr="src: imgSrc" />
        <div q-attr="attrs" style=""></div>
    </div>
</div>
```
- output

```html
<div>
    <div q-repeat="list | getList">
        <div q-text="name" q-show="isShow" q-class="red: isRed" style="<% if (__filterValue(this, "isShow")) { %> display: block; <% } %>" class="<% if (__filterValue(this, "isRed")) { %> red <% } %>"><%= __filterValue(this, "name") %></div>
        <input type="text" q-value="value" value="<%= __filterValue(this, "value") %>">
        <input type="checkbox" q-value="value" checked="<%= __filterValue(this, "value") %>">
        <img src="<%= __filterValue(this, "imgSrc") %>" alt="" q-src="imgSrc">
        <img src="<%= __filterValue(this, "imgSrc") %>" alt="" q-attr="src: imgSrc">
        <div q-attr="attrs" style="" <% var tmp = __filterValue(this, "attrs");if (typeof tmp === "object" && tmp) {for (var k in tmp) { %><%= k %>=<%= tmp[k] %> <% } } %>></div>
    </div>
</div>
```

