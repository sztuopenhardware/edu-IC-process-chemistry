/* ==========================================================================
   《集成工艺化学》交互式教学仿真实验平台 — 主控调度器 (app.js)
   实现：按章节分组的下拉菜单导航 + 级联下拉选择框 + 随堂检测 + 进度报告 + URL路由
   ========================================================================== */

(function () {
  const ICChem = window.ICChem;
  const STORAGE_KEY = "sztu_icchem_jc00158_progress_v1";

  // 扁平化索引便于前后翻页与快速查找
  const flatCases = [];
  ICChem.chapters.forEach((ch) => {
    ch.cases.forEach((cs) => {
      flatCases.push({ chapter: ch, caseItem: cs });
    });
  });

  // 读取本地学习记录
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { completed: {}, quizScores: {}, theme: "dark" };
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (_) {}
  }

  let userProgress = loadProgress();
  let currentCaseId = flatCases[0].caseItem.id;
  let activeSimInstance = null;

  // DOM 引用
  const els = {
    chapterDropdownBar: document.getElementById("chapterDropdownBar"),
    chapterSelect: document.getElementById("chapterSelect"),
    caseSelect: document.getElementById("caseSelect"),
    btnPrevCase: document.getElementById("btnPrevCase"),
    btnNextCase: document.getElementById("btnNextCase"),
    currentChapterTag: document.getElementById("currentChapterTag"),
    currentSyllabusRef: document.getElementById("currentSyllabusRef"),
    currentLevelBadges: document.getElementById("currentLevelBadges"),
    currentCaseTitle: document.getElementById("currentCaseTitle"),
    currentCaseSubtitle: document.getElementById("currentCaseSubtitle"),
    btnResetSim: document.getElementById("btnResetSim"),
    btnMarkComplete: document.getElementById("btnMarkComplete"),
    simHeaderMetrics: document.getElementById("simHeaderMetrics"),
    simViewport: document.getElementById("simViewport"),
    simReadoutGrid: document.getElementById("simReadoutGrid"),
    simControlsContainer: document.getElementById("simControlsContainer"),
    syllabusObjectivesBox: document.getElementById("syllabusObjectivesBox"),
    coreFormulaBox: document.getElementById("coreFormulaBox"),
    theoryPointsBox: document.getElementById("theoryPointsBox"),
    icApplicationBox: document.getElementById("icApplicationBox"),
    experimentGuideBox: document.getElementById("experimentGuideBox"),
    quizContainer: document.getElementById("quizContainer"),
    globalProgressFill: document.getElementById("globalProgressFill"),
    globalProgressText: document.getElementById("globalProgressText"),
    btnThemeToggle: document.getElementById("btnThemeToggle"),
    themeIcon: document.getElementById("themeIcon"),
    syllabusModal: document.getElementById("syllabusModal"),
    syllabusModalBody: document.getElementById("syllabusModalBody"),
    reportModal: document.getElementById("reportModal"),
    reportModalBody: document.getElementById("reportModalBody"),
    btnSyllabusModal: document.getElementById("btnSyllabusModal"),
    btnReportModal: document.getElementById("btnReportModal"),
    btnPrintReport: document.getElementById("btnPrintReport"),
    btnClearProgress: document.getElementById("btnClearProgress")
  };

  /* -------------------- 主题初始化与切换 -------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    els.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    userProgress.theme = theme;
    saveProgress();
  }

  els.btnThemeToggle.addEventListener("click", () => {
    applyTheme(userProgress.theme === "dark" ? "light" : "dark");
  });

  /* -------------------- 章节下拉菜单栏 + 级联 <select> 渲染 -------------------- */
  function closeAllDropdownPanels() {
    els.chapterDropdownBar.querySelectorAll(".chapter-menu-item.open").forEach((item) => {
      item.classList.remove("open");
    });
  }

  function renderChapterDropdownNavbar() {
    const activeEntry = flatCases.find((x) => x.caseItem.id === currentCaseId) || flatCases[0];
    els.chapterDropdownBar.innerHTML = "";

    ICChem.chapters.forEach((ch) => {
      const doneInCh = ch.cases.filter((c) => userProgress.completed[c.id]).length;
      const menuItem = document.createElement("div");
      menuItem.className = "chapter-menu-item" + (ch.id === activeEntry.chapter.id ? " active-chapter" : "");

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "chapter-menu-trigger";
      trigger.innerHTML = `
        <span>${ch.shortTitle}</span>
        <span class="chapter-count-pill">${doneInCh}/${ch.cases.length}</span>
        <span class="caret">▾</span>
      `;

      const panel = document.createElement("div");
      panel.className = "chapter-dropdown-panel";
      panel.innerHTML = `
        <div class="dropdown-chapter-header">
          <span>${ch.fullTitle.split("(")[0]}</span>
          <span>${ch.weeks}</span>
        </div>
      `;

      ch.cases.forEach((cs) => {
        const isDone = !!userProgress.completed[cs.id];
        const isCurr = cs.id === currentCaseId;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dropdown-case-btn" + (isCurr ? " active-case" : "");
        btn.innerHTML = `
          <div class="dropdown-case-info">
            <span class="dropdown-case-title">${cs.title}</span>
            <span class="dropdown-case-sub">${cs.shortDesc}</span>
          </div>
          <span class="dropdown-case-status">${isDone ? "✅" : isCurr ? "🔵" : ""}</span>
        `;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeAllDropdownPanels();
          selectCase(cs.id);
        });
        panel.appendChild(btn);
      });

      // 支持点击开关下拉菜单，以及桌面端鼠标移入平滑展开
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const wasOpen = menuItem.classList.contains("open");
        closeAllDropdownPanels();
        if (!wasOpen) menuItem.classList.add("open");
      });

      menuItem.addEventListener("mouseenter", () => {
        if (window.innerWidth > 900) {
          closeAllDropdownPanels();
          menuItem.classList.add("open");
        }
      });
      menuItem.addEventListener("mouseleave", () => {
        if (window.innerWidth > 900) {
          menuItem.classList.remove("open");
        }
      });

      menuItem.appendChild(trigger);
      menuItem.appendChild(panel);
      els.chapterDropdownBar.appendChild(menuItem);
    });
  }

  document.addEventListener("click", () => closeAllDropdownPanels());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdownPanels();
      els.syllabusModal.classList.add("hidden");
      els.reportModal.classList.add("hidden");
    }
  });

  function populateCascadeSelects() {
    const activeEntry = flatCases.find((x) => x.caseItem.id === currentCaseId) || flatCases[0];
    const activeCh = activeEntry.chapter;

    // 1. 填充章节 <select>
    els.chapterSelect.innerHTML = ICChem.chapters
      .map((ch) => `<option value="${ch.id}" ${ch.id === activeCh.id ? "selected" : ""}>${ch.fullTitle.split("(")[0].trim()}（共${ch.cases.length}个案例）</option>`)
      .join("");

    // 2. 填充当前章节下的案例 <select>
    els.caseSelect.innerHTML = activeCh.cases
      .map((cs) => {
        const mark = userProgress.completed[cs.id] ? "✓ " : "";
        return `<option value="${cs.id}" ${cs.id === currentCaseId ? "selected" : ""}>${mark}${cs.title}</option>`;
      })
      .join("");
  }

  els.chapterSelect.addEventListener("change", () => {
    const ch = ICChem.chapters.find((c) => c.id === els.chapterSelect.value);
    if (ch && ch.cases.length > 0) {
      selectCase(ch.cases[0].id);
    }
  });

  els.caseSelect.addEventListener("change", () => {
    selectCase(els.caseSelect.value);
  });

  /* -------------------- 等级徽章辅助 -------------------- */
  function levelBadgeHtml(lvl) {
    if (lvl === "掌握") return `<span class="lvl-badge lvl-master">【掌握】</span>`;
    if (lvl === "理解") return `<span class="lvl-badge lvl-comprehend">【理解】</span>`;
    if (lvl === "了解") return `<span class="lvl-badge lvl-know">【了解】</span>`;
    return `<span class="lvl-badge lvl-lab">【${lvl}】</span>`;
  }

  /* -------------------- 渲染右侧教学内容与随堂检测 -------------------- */
  function renderPedagogySidebar(cs) {
    // 1. 大纲学习目标
    els.syllabusObjectivesBox.innerHTML = cs.objectives
      .map((o) => `<div class="obj-row">${levelBadgeHtml(o.level)}<span>${o.text}</span></div>`)
      .join("");

    // 2. 核心公式与原理要点
    els.coreFormulaBox.innerHTML = cs.formulaHtml;
    els.theoryPointsBox.innerHTML = `<ul>${cs.theoryPoints.map((p) => `<li>${p}</li>`).join("")}</ul>`;

    // 3. 芯片工艺映射与实验观察指南
    els.icApplicationBox.innerHTML = cs.icConnection;
    els.experimentGuideBox.innerHTML = `<ol>${cs.guideSteps.map((s) => `<li>${s}</li>`).join("")}</ol>`;

    // 4. 随堂检测交互题
    els.quizContainer.innerHTML = "";
    cs.quizzes.forEach((qz, qIdx) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.innerHTML = `
        <div class="quiz-q">${qIdx + 1}. ${qz.q}</div>
        <div class="quiz-options"></div>
        <div class="quiz-explain" style="display:none"></div>
      `;
      const optBox = card.querySelector(".quiz-options");
      const expBox = card.querySelector(".quiz-explain");

      qz.options.forEach((optTxt, optIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.textContent = `${String.fromCharCode(65 + optIdx)}. ${optTxt}`;
        btn.addEventListener("click", () => {
          optBox.querySelectorAll("button").forEach((b, bIdx) => {
            b.disabled = true;
            if (bIdx === qz.answer) b.classList.add("correct");
          });
          if (optIdx !== qz.answer) {
            btn.classList.add("wrong");
          } else {
            userProgress.quizScores[cs.id] = true;
            userProgress.completed[cs.id] = true;
            saveProgress();
            updateGlobalProgressUI();
            renderChapterDropdownNavbar();
            populateCascadeSelects();
            updateCompleteButton();
          }
          expBox.style.display = "block";
          expBox.innerHTML = `<strong>${optIdx === qz.answer ? "✅ 回答正确！" : "❌ 再想想看："}</strong> ${qz.explain}`;
        });
        optBox.appendChild(btn);
      });
      els.quizContainer.appendChild(card);
    });
  }

  /* -------------------- 全局进度与按钮状态 -------------------- */
  function updateGlobalProgressUI() {
    const total = flatCases.length;
    const done = flatCases.filter((x) => userProgress.completed[x.caseItem.id]).length;
    const pct = Math.round((done / total) * 100);
    els.globalProgressFill.style.width = `${pct}%`;
    els.globalProgressText.textContent = `${done} / ${total}`;
  }

  function updateCompleteButton() {
    const done = !!userProgress.completed[currentCaseId];
    els.btnMarkComplete.classList.toggle("completed", done);
    els.btnMarkComplete.textContent = done ? "✅ 已掌握本节（点击取消）" : "✓ 标记本节已掌握";
  }

  els.btnMarkComplete.addEventListener("click", () => {
    if (userProgress.completed[currentCaseId]) {
      delete userProgress.completed[currentCaseId];
    } else {
      userProgress.completed[currentCaseId] = true;
    }
    saveProgress();
    updateCompleteButton();
    updateGlobalProgressUI();
    renderChapterDropdownNavbar();
    populateCascadeSelects();
  });

  els.btnResetSim.addEventListener("click", () => {
    if (activeSimInstance && typeof activeSimInstance.reset === "function") {
      activeSimInstance.reset();
    }
  });

  /* -------------------- 切换加载指定案例 -------------------- */
  function selectCase(caseId, updateHash = true) {
    const foundIdx = flatCases.findIndex((x) => x.caseItem.id === caseId);
    const entry = foundIdx >= 0 ? flatCases[foundIdx] : flatCases[0];
    const idx = foundIdx >= 0 ? foundIdx : 0;

    currentCaseId = entry.caseItem.id;
    if (updateHash) {
      try {
        history.replaceState(null, "", `#${currentCaseId}`);
      } catch (_) {}
    }

    // 销毁上一个仿真实例动画循环
    if (activeSimInstance && typeof activeSimInstance.destroy === "function") {
      activeSimInstance.destroy();
      activeSimInstance = null;
    }

    // 更新顶部标题横幅
    els.currentChapterTag.textContent = entry.chapter.shortTitle;
    els.currentSyllabusRef.textContent = entry.caseItem.syllabusRef;
    els.currentLevelBadges.innerHTML = entry.caseItem.levels.map(levelBadgeHtml).join("");
    els.currentCaseTitle.textContent = entry.caseItem.title;
    els.currentCaseSubtitle.textContent = entry.caseItem.shortDesc;

    els.btnPrevCase.disabled = idx === 0;
    els.btnNextCase.disabled = idx === flatCases.length - 1;

    renderChapterDropdownNavbar();
    populateCascadeSelects();
    updateCompleteButton();
    renderPedagogySidebar(entry.caseItem);

    // 启动对应交互仿真引擎
    const simFactory = ICChem.sims[currentCaseId];
    if (simFactory) {
      activeSimInstance = simFactory({
        viewport: els.simViewport,
        readoutEl: els.simReadoutGrid,
        controlsEl: els.simControlsContainer,
        headerMetricsEl: els.simHeaderMetrics
      });
    }
  }

  els.btnPrevCase.addEventListener("click", () => {
    const idx = flatCases.findIndex((x) => x.caseItem.id === currentCaseId);
    if (idx > 0) selectCase(flatCases[idx - 1].caseItem.id);
  });

  els.btnNextCase.addEventListener("click", () => {
    const idx = flatCases.findIndex((x) => x.caseItem.id === currentCaseId);
    if (idx >= 0 && idx < flatCases.length - 1) selectCase(flatCases[idx + 1].caseItem.id);
  });

  // 右侧知识面板 Tab 切换
  document.querySelectorAll(".sidebar-tab").forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-tab").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".sidebar-tab-content").forEach((p) => p.classList.remove("active"));
      tabBtn.classList.add("active");
      tabBtn.setAttribute("aria-selected", "true");
      const target = document.getElementById(tabBtn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  /* -------------------- 教学大纲全景弹窗 & 实验成绩单弹窗 -------------------- */
  function openSyllabusModal() {
    const m = ICChem.courseMeta;
    let html = `
      <p><strong>开课单位：</strong>${m.university} · ${m.unit} &nbsp;|&nbsp; <strong>授课对象：</strong>${m.students}</p>
      <p><strong>学分与学时：</strong>${m.credits}，${m.hours}</p>
      <h3 style="margin-top:1rem;color:var(--accent-cyan)">一、课程总评成绩构成（满分100分）</h3>
      <table class="syllabus-table">
        <thead><tr><th>考核环节</th><th>成绩占比</th><th>考核细则说明</th></tr></thead>
        <tbody>
          ${m.grading.map((g) => `<tr><td><strong>${g.item}</strong></td><td>${g.ratio}</td><td>${g.detail}</td></tr>`).join("")}
        </tbody>
      </table>
      <h3 style="margin-top:1rem;color:var(--accent-cyan)">二、教学大纲章节与交互仿真案例全景导航（点击任意案例直达）</h3>
      <table class="syllabus-table">
        <thead><tr><th>章节模块 / 教学周次</th><th>仿真案例名称</th><th>大纲要求层次</th><th>状态</th></tr></thead>
        <tbody>
    `;

    ICChem.chapters.forEach((ch) => {
      ch.cases.forEach((cs, idx) => {
        const done = userProgress.completed[cs.id] ? "✅ 已完成" : "未标记";
        html += `
          <tr>
            ${idx === 0 ? `<td rowspan="${ch.cases.length}"><strong>${ch.shortTitle}</strong><br/><span style="font-size:0.75rem;color:var(--text-muted)">${ch.weeks}</span></td>` : ""}
            <td><a href="#${cs.id}" class="modal-jump-link" data-case="${cs.id}" style="color:var(--accent-cyan);text-decoration:none;font-weight:600">${cs.title}</a></td>
            <td>${cs.levels.join(" / ")}</td>
            <td>${done}</td>
          </tr>
        `;
      });
    });

    html += `</tbody></table>`;
    els.syllabusModalBody.innerHTML = html;
    els.syllabusModalBody.querySelectorAll(".modal-jump-link").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        els.syllabusModal.classList.add("hidden");
        selectCase(a.dataset.case);
      });
    });
    els.syllabusModal.classList.remove("hidden");
  }

  function openReportModal() {
    const doneCount = flatCases.filter((x) => userProgress.completed[x.caseItem.id]).length;
    const quizCount = Object.keys(userProgress.quizScores).length;
    const labCh = ICChem.chapters.find((c) => c.id === "labs");
    const labDone = labCh ? labCh.cases.filter((c) => userProgress.completed[c.id]).length : 0;

    let html = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.8rem;margin-bottom:1.1rem">
        <div class="readout-card"><span class="readout-label">课程学习完成度</span><span class="readout-value positive">${doneCount} / ${flatCases.length}<span class="readout-unit">节</span></span></div>
        <div class="readout-card"><span class="readout-label">随堂检测答对模块</span><span class="readout-value">${quizCount} / ${flatCases.length}<span class="readout-unit">节</span></span></div>
        <div class="readout-card"><span class="readout-label">五大必做实验完成数</span><span class="readout-value positive">${labDone} / 5<span class="readout-unit">项 (占总评30%)</span></span></div>
      </div>
      <table class="syllabus-table">
        <thead><tr><th>所属章节</th><th>实验/理论仿真模块</th><th>掌握状态</th><th>随堂测验</th></tr></thead>
        <tbody>
          ${flatCases
            .map(
              ({ chapter, caseItem }) => `
            <tr>
              <td>${chapter.shortTitle}</td>
              <td>${caseItem.title}</td>
              <td>${userProgress.completed[caseItem.id] ? "✅ 已掌握" : "⏳ 学习中"}</td>
              <td>${userProgress.quizScores[caseItem.id] ? "🌟 通过" : "—"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
    els.reportModalBody.innerHTML = html;
    els.reportModal.classList.remove("hidden");
  }

  els.btnSyllabusModal.addEventListener("click", openSyllabusModal);
  els.btnReportModal.addEventListener("click", openReportModal);

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.close).classList.add("hidden");
    });
  });

  [els.syllabusModal, els.reportModal].forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.add("hidden");
    });
  });

  els.btnPrintReport.addEventListener("click", () => window.print());
  els.btnClearProgress.addEventListener("click", () => {
    userProgress = { completed: {}, quizScores: {}, theme: userProgress.theme };
    saveProgress();
    updateGlobalProgressUI();
    renderChapterDropdownNavbar();
    populateCascadeSelects();
    updateCompleteButton();
    openReportModal();
  });

  // 窗口尺寸变化时平滑重绘静态 Canvas 仿真（保留当前实验状态与参数）
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (activeSimInstance && typeof activeSimInstance.redraw === "function") {
        activeSimInstance.redraw();
      }
    }, 80);
  });

  // 支持浏览器前进后退 hash 跳转
  window.addEventListener("hashchange", () => {
    const hashId = location.hash.replace(/^#/, "");
    if (hashId && hashId !== currentCaseId && flatCases.some((x) => x.caseItem.id === hashId)) {
      selectCase(hashId, false);
    }
  });

  /* -------------------- 启动初始化 -------------------- */
  applyTheme(userProgress.theme || "dark");
  updateGlobalProgressUI();

  const initialHash = location.hash.replace(/^#/, "");
  const startId = flatCases.some((x) => x.caseItem.id === initialHash) ? initialHash : flatCases[0].caseItem.id;
  selectCase(startId, false);
})();
