// Emblem Strategic — Blog Engine v2
// Posts are defined in posts.js as EMBLEM_POSTS array.
// To add a new post: add an object to that array.

(function () {
  'use strict';

  // ── Router ────────────────────────────────────────────────────────────────
  function getSlug() {
    return new URLSearchParams(window.location.search).get('post');
  }
  function getTag() {
    return new URLSearchParams(window.location.search).get('tag') || '';
  }

  window.navigateToPost = function (slug) {
    var u = new URL(window.location.href);
    u.searchParams.set('post', slug);
    u.searchParams.delete('tag');
    history.pushState({}, '', u);
    render();
  };

  window.navigateToIndex = function (tag) {
    var u = new URL(window.location.href);
    u.searchParams.delete('post');
    if (tag) { u.searchParams.set('tag', tag); } else { u.searchParams.delete('tag'); }
    history.pushState({}, '', u);
    render();
  };

  window.addEventListener('popstate', render);

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    var wrap = document.getElementById('page-wrap');
    if (!wrap) return;
    var slug = getSlug();
    if (slug) {
      var post = null;
      for (var i = 0; i < EMBLEM_POSTS.length; i++) {
        if (EMBLEM_POSTS[i].slug === slug) { post = EMBLEM_POSTS[i]; break; }
      }
      if (post) { renderPost(wrap, post); return; }
    }
    renderIndex(wrap);
  }

  // ── Index view ────────────────────────────────────────────────────────────
  function renderIndex(wrap) {
    document.title = 'Perspectives - Emblem Strategic';
    var activeTag = getTag();

    // Unique sorted tags
    var tagMap = {};
    EMBLEM_POSTS.forEach(function (p) { p.tags.forEach(function (t) { tagMap[t] = true; }); });
    var allTags = Object.keys(tagMap).sort();

    // Filter + sort
    var posts = EMBLEM_POSTS.filter(function (p) {
      return !activeTag || p.tags.indexOf(activeTag) !== -1;
    }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    wrap.innerHTML = '';
    var outer = el('div', 'blog-index');

    // Header
    var hdr = el('div', 'blog-index-header');
    hdr.appendChild(txt('div', 'blog-index-label', 'From the Field'));
    hdr.appendChild(txt('h1', 'blog-index-title', 'Perspectives'));
    hdr.appendChild(txt('p', 'blog-index-desc', 'Thinking on stakeholder strategy, civic leadership, and the work of building trust across difference.'));
    outer.appendChild(hdr);

    // Tag filter
    var tf = el('div', 'tag-filter');
    tf.appendChild(txt('span', 'tag-filter-label', 'Filter:'));
    var allBtn = txt('button', 'tag-btn' + (!activeTag ? ' active' : ''), 'All');
    allBtn.onclick = function () { window.navigateToIndex(null); };
    tf.appendChild(allBtn);
    allTags.forEach(function (tag) {
      var b = txt('button', 'tag-btn' + (activeTag === tag ? ' active' : ''), tag);
      b.onclick = function () { window.navigateToIndex(tag); };
      tf.appendChild(b);
    });
    outer.appendChild(tf);

    if (posts.length === 0) {
      outer.appendChild(txt('p', '', 'No posts found for this topic.'));
    }

    // Post cards
    posts.forEach(function (post) {
      var card = el('div', 'post-card');
      card.onclick = function () { window.navigateToPost(post.slug); };

      var meta = el('div', 'post-card-meta');
      meta.appendChild(txt('span', 'post-card-date', post.dateDisplay));
      meta.appendChild(txt('span', 'post-card-read', post.readTime));
      var tagRow = el('div', 'post-card-tags');
      post.tags.forEach(function (t) { tagRow.appendChild(txt('span', 'post-tag', t)); });
      meta.appendChild(tagRow);
      card.appendChild(meta);

      card.appendChild(txt('h2', 'post-card-title', post.title));
      card.appendChild(txt('p', 'post-card-excerpt', post.excerpt));

      var rm = txt('a', 'post-card-readmore', 'Read more →');
      rm.href = '/blog.html?post=' + post.slug;
      rm.onclick = function (e) { e.stopPropagation(); e.preventDefault(); window.navigateToPost(post.slug); };
      card.appendChild(rm);
      outer.appendChild(card);
    });

    wrap.appendChild(outer);
  }

  // ── Post view ─────────────────────────────────────────────────────────────
  function renderPost(wrap, post) {
    document.title = post.title + ' - Emblem Strategic';
    wrap.innerHTML = '';
    var outer = el('div', 'post-view');

    var back = txt('a', 'post-back', '← Back to Perspectives');
    back.href = '/blog.html';
    back.onclick = function (e) { e.preventDefault(); window.navigateToIndex(null); };
    outer.appendChild(back);

    var hdr = el('div', 'post-header');
    var meta = el('div', 'post-meta');
    meta.appendChild(txt('span', 'post-date', post.dateDisplay));
    meta.appendChild(txt('span', 'post-read', post.readTime));
    var tagRow = el('div', 'post-tags');
    post.tags.forEach(function (t) {
      var s = txt('span', 'post-tag', t);
      s.style.cursor = 'pointer';
      s.onclick = function () { window.navigateToIndex(t); };
      tagRow.appendChild(s);
    });
    meta.appendChild(tagRow);
    hdr.appendChild(meta);
    hdr.appendChild(txt('h1', 'post-title', post.title));
    outer.appendChild(hdr);

    var body = el('div', 'post-body');
    body.innerHTML = post.body;
    outer.appendChild(body);

    if (post.byline) {
      outer.appendChild(txt('div', 'post-byline', post.byline));
    }

    wrap.appendChild(outer);
    window.scrollTo(0, 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function txt(tag, cls, text) {
    var e = el(tag, cls);
    e.textContent = text;
    return e;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

}());
