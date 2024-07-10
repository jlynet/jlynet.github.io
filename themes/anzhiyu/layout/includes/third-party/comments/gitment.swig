var gitment = new {{CommentsClass}}({
     id: '{{ page.date }}',
     owner: '{{ theme.gitment.github_user }}',
     repo: '{{ theme.gitment.github_repo }}',

<!-- LOCAL: You can save these files to your site and update links -->
    {% if theme.gitment.mint %}
        {% set CommentsClass = "Gitmint" %}
        <link rel="stylesheet" href="https://aimingoo.github.io/gitmint/style/default.css">
        <script src="https://aimingoo.github.io/gitmint/dist/gitmint.browser.js"></script>
    {% else %}
        {% set CommentsClass = "Gitment" %}
        <!-- <link rel="stylesheet" href="https://imsun.github.io/gitment/style/default.css"> -->
        <!-- <script src="https://imsun.github.io/gitment/dist/gitment.browser.js"></script> -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/default.css">
        <script src="https://cdn.jsdelivr.net/gh/theme-next/theme-next-gitment@1/gitment.browser.js"></script>
    {% endif %}
<!-- END LOCAL -->