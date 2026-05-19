// Emblem Strategic - Blog Engine v3
// Posts defined in posts.js as EMBLEM_POSTS array.
// Add new posts by adding objects to that array.

(function () {
  'use strict';

  var slugToFile = {
    'landing-the-top-job-nonprofit-executive-search': 'landing-the-top-job.html',
    'corporate-citizenship-still-counts': 'corporate-citizenship.html',
    'weworks-boston-diversity-success-story': 'weworks-boston-diversity-success-story.html',
    'ai-fatigue-hot-takes': 'ai-fatigue.html',
    'executive-coaching-three-truths': 'executive-coaching-three-truths.html'
  };
  var fileToSlug = {
    'landing-the-top-job.html': 'landing-the-top-job-nonprofit-executive-search',
    'corporate-citizenship.html': 'corporate-citizenship-still-counts',
    'weworks-boston-diversity-success-story.html': 'weworks-boston-diversity-success-story',
    'ai-fatigue.html': 'ai-fatigue-hot-takes',
    'executive-coaching-three-truths.html': 'executive-coaching-three-truths'
  };

  function getSlug() {
    var qs = new URLSearchParams(window.location.search).get('post');
    if (qs) return qs;
    var filename = window.location.pathname.split('/').pop();
    return fileToSlug[filename] || null;
  }

  function getTag() { return new URLSearchParams(window.location.search).get('tag') || ''; }

  window.navigateToPost = function (slug) {
    var file = slugToFile[slug];
    if (file) {
      history.pushState({}, '', '/' + file);
    } else {
      var u = new URL(window.location.href);
      u.searchParams.set('post', slug);
      u.searchParams.delete('tag');
      history.pushState({}, '', u);
    }
    render();
  };

  window.navigateToIndex = function (tag) {
    var u = new URL(window.location.origin + '/blog.html');
    if (tag) { u.searchParams.set('tag', tag); }
    history.pushState({}, '', u);
    render();
  };

  window.addEventListener('popstate', render);

  function render() {
    var slug = getSlug();
    var wrap = document.getElementById('page-wrap');
    var hero = document.getElementById('blog-hero');
    var tagBar = document.getElementById('blog-sidebar');
    if (!wrap) return;
    if (slug) {
      var post = null;
      for (var i = 0; i < EMBLEM_POSTS.length; i++) {
        if (EMBLEM_POSTS[i].slug === slug) { post = EMBLEM_POSTS[i]; break; }
      }
      if (post) {
        if (hero) hero.style.display = 'none';
        if (tagBar) tagBar.style.display = 'none';
        renderPost(wrap, post);
        return;
      }
    }
    if (hero) hero.style.display = '';
    if (tagBar) tagBar.style.display = '';
    renderTagBar(tagBar);
    renderIndex(wrap);
  }

  function renderTagBar(bar) {
    if (!bar) return;
    var activeTag = getTag();
    var tagMap = {};
    EMBLEM_POSTS.forEach(function (p) { p.tags.forEach(function (t) { tagMap[t] = true; }); });
    var allTags = Object.keys(tagMap).sort();
    bar.innerHTML = '';
    var inner = el('div', 'sidebar-inner');
    inner.appendChild(txt('h3', 'sidebar-heading', 'Topics'));
    var allBtn = txt('button', 'sidebar-tag' + (!activeTag ? ' active' : ''), 'All');
    allBtn.onclick = function () { window.navigateToIndex(null); };
    inner.appendChild(allBtn);
    allTags.forEach(function (tag) {
      var b = txt('button', 'sidebar-tag' + (activeTag === tag ? ' active' : ''), tag);
      b.onclick = function () { window.navigateToIndex(tag); };
      inner.appendChild(b);
    });
    bar.appendChild(inner);
  }

  function renderIndex(wrap) {
    document.title = 'Emblematic - Emblem Strategic';
    var activeTag = getTag();
    var posts = EMBLEM_POSTS.filter(function (p) {
      return !activeTag || p.tags.indexOf(activeTag) !== -1;
    }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    wrap.innerHTML = '';
    var outer = el('div', 'blog-index');
    if (posts.length === 0) { outer.appendChild(txt('p', '', 'No posts found for this topic.')); }
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
      var file = slugToFile[post.slug] || ('blog.html?post=' + post.slug);
      var rm = txt('a', 'post-card-readmore', 'Read more \u2192');
      rm.href = '/' + file;
      rm.onclick = function (e) { e.stopPropagation(); e.preventDefault(); window.navigateToPost(post.slug); };
      card.appendChild(rm);
      outer.appendChild(card);
    });
    wrap.appendChild(outer);
  }

  function renderPost(wrap, post) {
    document.title = post.title + ' - Emblem Strategic';
    wrap.innerHTML = '';
    var outer = el('div', 'post-view');
    var back = txt('a', 'post-back', '\u2190 Back to Perspectives');
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
    wrap.appendChild(outer);
    window.scrollTo(0, 0);
  }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function txt(tag, cls, text) { var e = el(tag, cls); e.textContent = text; return e; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
}());
