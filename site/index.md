---
layout: home
title: Compound Engineering
permalink: /
description: AI skills that make each unit of engineering work easier than the last. A plugin for the coding agent you already use.
hero:
  name: Compound Engineering
  text: Each unit of work easier than the last.
  tagline: A plugin of skills for AI coding agents. Brainstorm, plan, build, review, then capture what you learned where the next change can read it.
  logo:
    light: /assets/logo.png
    dark: /assets/logo.png
    alt: Compound Engineering logo
    width: 120
    height: 120
  actions:
    - theme: brand
      text: Get started
      link: /install/
    - theme: alt
      text: Browse the skills
      link: /guides/
---

<section class="ce-home-section ce-install">
  <h2 id="install">Install in Claude Code</h2>
  <p>Two commands inside Claude Code. Other hosts are on the <a href="/install/">install page</a>.</p>
  <div class="language-text highlighter-rouge"><div class="highlight"><pre class="highlight"><code>/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering</code></pre></div></div>
  <p class="ce-version">Current release <span class="ce-version-badge">v{{ site.data.ce.version }}</span></p>
</section>

<section class="ce-home-section ce-demo">
  <h2 id="the-loop">The loop</h2>
  <p>Every iteration runs the same way: brainstorm what it needs to be, plan how, build it, review it, then write the learning down so the next iteration starts further ahead.</p>
  <figure>
    <img src="/assets/demo/compound-loop.gif" alt="Animated terminal demo of the compound engineering loop: brainstorm, plan, work, and compound running in a coding agent" loading="lazy" width="1200" height="675">
    <figcaption>The core loop running in a coding agent.</figcaption>
  </figure>
</section>

{% include ce/hosts.html %}

{% include ce/skill_grid.html %}

<section class="ce-home-section ce-more">
  <h2 id="learn-more">Learn more</h2>
  <ul>
    <li><a href="https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents">Compound engineering: how Every codes with agents</a></li>
    <li><a href="https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it">The story behind compounding engineering</a></li>
    <li><a href="https://github.com/EveryInc/compound-engineering-plugin">Source and issues on GitHub</a></li>
  </ul>
</section>
