/* ==========================================================================
   《集成工艺化学》交互仿真引擎 — 第五章(IC专用材料3例) & 第六章(光掩模与光刻胶3例)
   ========================================================================== */

(function () {
  const ICChem = window.ICChem;

  /* ==========================================================================
     5.1 电子级硅提纯、直拉单晶硅、晶体缺陷与 SOI/应变硅 (ch5-silicon)
     ========================================================================== */
  ICChem.registerSim("ch5-silicon", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { view: "cz_defect", defectLevel: 1, geFrac: 0.25 };
    const { resize } = ICChem.ui.createCanvas(viewport, 405);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换硅基材料结构与先进衬底工程视图",
          activeValue: state.view,
          fullSpan: true,
          options: [
            { label: "单晶硅晶格与点/位错缺陷", value: "cz_defect" },
            { label: "多晶硅 (晶界散射对比)", value: "poly" },
            { label: "SOI 绝缘体上硅 (埋氧层隔离)", value: "soi" },
            { label: "应变硅 Strained-Si (SiGe缓冲拉伸)", value: "strained" }
          ],
          onChange: (v) => { state.view = v; buildControls(); }
        }).el
      );

      if (state.view === "cz_defect" || state.view === "poly") {
        controlsEl.appendChild(
          ICChem.ui.slider({
            label: "晶体缺陷与重金属杂质等级（0=11N无位错电子级，5=高缺陷工业硅）", min: 0, max: 5, step: 1, value: state.defectLevel, unit: " 级", fullSpan: true,
            onInput: (v) => { state.defectLevel = v; }
          }).el
        );
      } else {
        controlsEl.appendChild(
          ICChem.ui.slider({
            label: "Si₁₋ₓGeₓ 弛豫衬底锗组分 x（调控顶层硅双轴拉伸应变）", min: 0.0, max: 0.40, step: 0.05, value: state.geFrac, unit: "", fullSpan: true,
            onInput: (v) => { state.geFrac = v; }
          }).el
        );
      }
    }

    function render() {
      tick += 0.04;
      const purityTxt = state.defectLevel === 0 ? "11N (99.999999999%)" : state.defectLevel <= 2 ? "9N 电子级" : "6N 太阳能/冶金级";
      const mobilityGain = state.view === "strained" ? (1 + state.geFrac * 1.75) : state.view === "poly" ? 0.08 : Math.max(0.25, 1 - state.defectLevel * 0.14);
      const leakageTxt = state.view === "soi" ? "极低 (BOX全介质隔离)" : state.defectLevel >= 3 ? "高漏电失效风险!" : "正常皮安级 (pA)";

      headerMetricsEl.textContent = "西门子法三氯氢硅精馏还原 (11N多晶硅) → 直拉法 (CZ) 300mm 无位错单晶硅棒 → 晶圆切片与CMP抛光";
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "电子级纯度等级", value: purityTxt, unit: "", tone: state.defectLevel <= 1 ? "positive" : "warning" },
        { label: "电子有效迁移率比 μ/μ₀", value: mobilityGain.toFixed(2), unit: "× 单晶Si", tone: mobilityGain >= 1 ? "positive" : "warning" },
        { label: "PN结/衬底漏电控制", value: leakageTxt, unit: "", tone: state.defectLevel >= 3 && state.view !== "soi" ? "danger" : "positive" },
        { label: "晶格常数 a (Si=5.431Å)", value: state.view === "strained" ? (5.431 * (1 + 0.042 * state.geFrac)).toFixed(3) : "5.431", unit: "Å" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：CZ 直拉单晶硅炉简图
      const lx = 38, ly = 36, lw = w * 0.36 - 48, lh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      const cx = lx + lw / 2;
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CZ 直拉单晶生长炉 (1420°C)", cx, ly + 24);

      // 石英坩埚与熔融硅液
      const crucY = ly + lh - 92;
      ctx.fillStyle = "rgba(251, 146, 60, 0.78)";
      ctx.fillRect(cx - 64, crucY, 128, 56);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 66, crucY - 12, 132, 70);

      // 旋转提拉的单晶硅锭
      ctx.fillStyle = "#475569";
      ctx.fillRect(cx - 3, ly + 38, 6, 36); // 籽晶轴
      const ingotGrad = ctx.createLinearGradient(cx - 28, 0, cx + 28, 0);
      ingotGrad.addColorStop(0, "#334155");
      ingotGrad.addColorStop(0.5, "#94a3b8");
      ingotGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = ingotGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 4, ly + 74);
      ctx.lineTo(cx - 28, ly + 102);
      ctx.lineTo(cx - 28, crucY + 4);
      ctx.lineTo(cx + 28, crucY + 4);
      ctx.lineTo(cx + 28, ly + 102);
      ctx.lineTo(cx + 4, ly + 74);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px sans-serif";
      ctx.fillText("熔融高纯硅 (1420°C)", cx, crucY + 34);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("石英坩埚微量供氧 → 内吸杂", cx, ly + lh - 12);

      // 右侧：四种硅基微观晶格/异质叠层切换视图
      const rx = w * 0.38, ry = 36, rw = w - rx - 32, rh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      if (state.view === "cz_defect") {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("单晶硅长程有序晶格 vs 空位/自间隙/重金属点缺陷", rx + rw / 2, ry + 26);

        const cols = 8, rows = 5;
        const sx = (rw - 90) / (cols - 1), sy = (rh - 115) / (rows - 1);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = rx + 45 + c * sx;
            const ay = ry + 62 + r * sy;
            // 若缺陷等级高，特定阵点出现【空位 Vacancy】
            const isVacancy = state.defectLevel >= 2 && r === 2 && c === 3;
            if (isVacancy) {
              ctx.strokeStyle = "#fb7185";
              ctx.setLineDash([3, 3]);
              ctx.beginPath();
              ctx.arc(ax, ay, 11, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = "#fb7185";
              ctx.font = "10px sans-serif";
              ctx.fillText("空位V", ax, ay + 4);
              continue;
            }
            ctx.beginPath();
            ctx.arc(ax, ay, 10.5, 0, Math.PI * 2);
            const isSubImpurity = state.defectLevel >= 1 && r === 1 && c === 5;
            ctx.fillStyle = isSubImpurity ? "#a78bfa" : "#38bdf8";
            ctx.fill();
            if (isSubImpurity) {
              ctx.fillStyle = "#fff";
              ctx.font = "9px sans-serif";
              ctx.fillText("C代位", ax, ay + 3);
            }
          }
        }
        // 间隙氧 / 间隙铁重金属杂质
        if (state.defectLevel >= 1) {
          ctx.beginPath();
          ctx.arc(rx + 45 + 1.5 * sx, ry + 62 + 1.5 * sy, 8, 0, Math.PI * 2);
          ctx.fillStyle = "#34d399";
          ctx.fill();
          ctx.fillStyle = "#34d399";
          ctx.fillText("Oi间隙氧", rx + 45 + 1.5 * sx, ry + 62 + 1.5 * sy - 12);
        }
        if (state.defectLevel >= 3) {
          ctx.beginPath();
          ctx.arc(rx + 45 + 5.5 * sx, ry + 62 + 3.2 * sy, 9, 0, Math.PI * 2);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
          ctx.fillStyle = "#fb7185";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText("Fe/Cu深能级复合中心!", rx + 45 + 5.5 * sx, ry + 62 + 3.2 * sy - 13);
        }
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11.5px sans-serif";
        ctx.fillText("芯片有源区要求严格无位错，重金属杂质浓度须低于 10¹⁰ atoms/cm³", rx + rw / 2, ry + rh - 14);

      } else if (state.view === "poly") {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("多晶硅 (Polysilicon)：由不同晶粒取向小单晶拼接，存在高密度晶界", rx + rw / 2, ry + 26);

        // 绘制三个不同旋转角的小晶粒畴与晶界线
        const grains = [
          { cx: rx + rw * 0.26, cy: ry + rh * 0.5, ang: 0.12 },
          { cx: rx + rw * 0.54, cy: ry + rh * 0.46, ang: -0.45 },
          { cx: rx + rw * 0.78, cy: ry + rh * 0.54, ang: 0.38 }
        ];
        grains.forEach((g) => {
          ctx.save();
          ctx.translate(g.cx, g.cy);
          ctx.rotate(g.ang);
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              ctx.beginPath();
              ctx.arc(c * 24, r * 24, 7.5, 0, Math.PI * 2);
              ctx.fillStyle = "#38bdf8";
              ctx.fill();
            }
          }
          ctx.restore();
        });
        // 晶界虚线
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.39, ry + 52);
        ctx.lineTo(rx + rw * 0.42, ry + rh - 44);
        ctx.moveTo(rx + rw * 0.67, ry + 52);
        ctx.lineTo(rx + rw * 0.64, ry + rh - 44);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "11.5px sans-serif";
        ctx.fillText("黄色虚线：晶界 (Grain Boundary) 散射载流子，常用作多晶硅栅极或电阻", rx + rw / 2, ry + rh - 14);

      } else if (state.view === "soi") {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SOI (Silicon-On-Insulator) 绝缘体上硅三明治结构", rx + rw / 2, ry + 28);

        const sx = rx + 42, sw = rw - 84;
        // 顶层超薄单晶硅有源层
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(sx, ry + 68, sw, 46);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("顶层超薄无缺陷单晶硅有源层 (Top Si, 10–50 nm) — 制造晶体管沟道", sx + sw / 2, ry + 96);

        // 中间埋氧层 BOX
        ctx.fillStyle = "#2dd4bf";
        ctx.fillRect(sx, ry + 118, sw, 56);
        ctx.fillStyle = "#0f172a";
        ctx.fillText("埋藏二氧化硅绝缘层 (BOX SiO₂) — 彻底阻断衬底漏电流与寄生电容！", sx + sw / 2, ry + 150);

        // 底部机械支撑硅片
        ctx.fillStyle = "#1e3a5f";
        ctx.fillRect(sx, ry + 178, sw, 92);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("机械支撑单晶硅衬底 (Handle Wafer)", sx + sw / 2, ry + 228);

        ctx.fillStyle = "#34d399";
        ctx.font = "11.5px sans-serif";
        ctx.fillText("优势：消除 CMOS 闩锁效应 (Latch-up)、抗空间辐射、高频射频低损耗", rx + rw / 2, ry + rh - 14);

      } else {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("硅基应变硅 (Strained-Si)：在弛豫 Si₁₋ₓGeₓ 大晶格上外延拉伸硅层", rx + rw / 2, ry + 28);

        const cols = 7;
        const baseStep = 36;
        const sigeStep = baseStep * (1 + state.geFrac * 0.35);
        const startX = rx + rw / 2 - ((cols - 1) * sigeStep) / 2;

        // 顶部受双轴拉伸应变的薄层 Si 原子（水平被拉开，纵向微压缩）
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = startX + c * sigeStep;
            const ay = ry + 82 + r * 30;
            ctx.beginPath();
            ctx.arc(ax, ay, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();
            if (c < cols - 1) {
              ctx.strokeStyle = "#fbbf24";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(ax + 11, ay);
              ctx.lineTo(ax + sigeStep - 11, ay);
              ctx.stroke();
            }
          }
        }
        // 下方大晶格常数 SiGe 缓冲层
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = startX + c * sigeStep;
            const ay = ry + 158 + r * 38;
            ctx.beginPath();
            ctx.arc(ax, ay, 13, 0, Math.PI * 2);
            ctx.fillStyle = (r + c) % 3 === 0 && state.geFrac > 0.05 ? "#a855f7" : "#334155";
            ctx.fill();
          }
        }
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`◀◀ 面内双轴拉伸应变 (电子有效质量降低，迁移率提升 +${Math.round(state.geFrac * 175)}%!) ▶▶`, rx + rw / 2, ry + 56);
        ctx.fillStyle = "#c084fc";
        ctx.font = "11.5px sans-serif";
        ctx.fillText("紫色大原子：锗 Ge (a=5.658Å > Si 5.431Å) 撑开衬底晶格常数", rx + rw / 2, ry + rh - 14);
      }

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { view: "cz_defect", defectLevel: 1, geFrac: 0.25 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     5.2 化合物半导体 (GaAs/GaN/SiC) 与量子阱/量子点材料 (ch5-compound)
     ========================================================================== */
  ICChem.registerSim("ch5-compound", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const semis = {
      si: { name: "单晶硅 Si (一代参照)", eg: 1.12, type: "间接带隙", mob: 1450, ecField: 0.3, app: "数字逻辑CPU/存储芯片" },
      gaas: { name: "砷化镓 GaAs (二代IIIA-VA)", eg: 1.42, type: "直接带隙 (高效发光)", mob: 8500, ecField: 0.4, app: "5G手机射频PA、VCSEL近红外激光" },
      inp: { name: "磷化铟 InP (二代光通信)", eg: 1.34, type: "直接带隙", mob: 5400, ecField: 0.5, app: "1310/1550nm 高速光通信激光器与调制器" },
      sic: { name: "碳化硅 4H-SiC (三代宽禁带)", eg: 3.26, type: "间接宽禁带", mob: 900, ecField: 2.8, app: "800V新能源汽车主驱逆变高压MOSFET" },
      gan: { name: "氮化镓 GaN (三代宽禁带)", eg: 3.40, type: "直接宽禁带", mob: 2000, ecField: 3.3, app: "蓝白光LED、氮化镓快充与5G基站射频" }
    };

    let state = { semiKey: "gan", qdDiameterNm: 3.6 };
    const { resize } = ICChem.ui.createCanvas(viewport, 405);

    function wavelengthToRGB(wl) {
      let r = 0, g = 0, b = 0;
      if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; g = 0; b = 1; }
      else if (wl >= 440 && wl < 490) { r = 0; g = (wl - 440) / 50; b = 1; }
      else if (wl >= 490 && wl < 510) { r = 0; g = 1; b = -(wl - 510) / 20; }
      else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; b = 0; }
      else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; b = 0; }
      else if (wl >= 645 && wl <= 760) { r = 1; g = 0; b = 0; }
      else if (wl < 380) { r = 0.6; g = 0.2; b = 1; }
      else { r = 0.8; g = 0.1; b = 0.1; }
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换对比第一/二/三代半导体材料",
          activeValue: state.semiKey,
          fullSpan: true,
          options: Object.entries(semis).map(([k, s]) => ({ label: s.name.split(" ")[0] + " " + s.name.split(" ")[1], value: k })),
          onChange: (k) => { state.semiKey = k; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "化学量子点 (CdSe/ZnS 核壳 QDs) 纳米晶直径 D（观测尺寸量子限制光谱移动）", min: 2.0, max: 7.5, step: 0.1, value: state.qdDiameterNm, unit: " nm", fullSpan: true,
          onInput: (v) => { state.qdDiameterNm = v; draw(); }
        }).el
      );
    }

    function draw() {
      const sm = semis[state.semiKey];
      // CdSe 体材料 Eg_bulk = 1.74 eV; Brus 量子尺寸效应近似 Eg(D) = 1.74 + 3.75 / D^1.65
      const qdEg = 1.74 + 3.75 / Math.pow(state.qdDiameterNm, 1.65);
      const qdLambda = 1240 / qdEg; // nm
      const qdColor = wavelengthToRGB(qdLambda);

      headerMetricsEl.textContent = `${sm.name} (${sm.type}) | 核心应用：${sm.app}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: `${sm.name.split(" ")[1]} 禁带宽度 Eg`, value: sm.eg.toFixed(2), unit: "eV", tone: sm.eg > 2 ? "positive" : "" },
        { label: "电子迁移率 / 击穿场强", value: `${sm.mob} / ${sm.ecField}`, unit: "MV/cm" },
        { label: `量子点 (D=${state.qdDiameterNm.toFixed(1)}nm) 带隙`, value: qdEg.toFixed(2), unit: "eV", tone: "positive" },
        { label: "量子点荧光峰值波长 λ", value: qdLambda.toFixed(0), unit: "nm", tone: "warning" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：五种半导体禁带宽度与击穿电场对比条形图
      const lx = 44, ly = 36, lw = w * 0.48 - 56, lh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("一代/二代/三代半导体禁带宽度 Eg (eV) 与带隙类型对比", lx + 14, ly + 24);

      Object.entries(semis).forEach(([k, item], idx) => {
        const by = ly + 52 + idx * 54;
        const maxBar = lw - 145;
        const barW = (item.eg / 3.6) * maxBar;
        const active = k === state.semiKey;

        ctx.fillStyle = active ? "#38bdf8" : "#cbd5e1";
        ctx.font = active ? "bold 12px sans-serif" : "11.5px sans-serif";
        ctx.fillText(item.name.split(" ")[1], lx + 16, by + 16);

        ctx.fillStyle = active ? "#38bdf8" : "rgba(100,116,139,0.45)";
        ICChem.ui.drawRoundRect(ctx, lx + 78, by + 2, barW, 20, 4);
        ctx.fill();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "11px sans-serif";
        ctx.fillText(`${item.eg} eV (${item.type.slice(0, 4)})`, lx + 84 + barW, by + 16);
      });

      // 右侧：化合物量子阱分立能级 & 化学量子点粒径可调荧光发光瓶
      const rx = w * 0.5 + 10, ry = 36, rw = w * 0.5 - 36, rh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("量子阱分立势阱与胶体量子点尺寸发光效应", rx + rw / 2, ry + 24);

      // 左半小图：势阱宽度随 D 变窄，能级间距拉大
      const wx = rx + 26, wy = ry + 58, ww = rw * 0.46;
      const wellW = 24 + ((state.qdDiameterNm - 2.0) / 5.5) * 66;
      const wCenter = wx + ww / 2;
      const splitGap = Math.min(130, (qdEg / 2.9) * 125);

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2.2;
      // 导带量子势阱
      ctx.beginPath();
      ctx.moveTo(wCenter - 58, wy);
      ctx.lineTo(wCenter - wellW / 2, wy);
      ctx.lineTo(wCenter - wellW / 2, wy + 58);
      ctx.lineTo(wCenter + wellW / 2, wy + 58);
      ctx.lineTo(wCenter + wellW / 2, wy);
      ctx.lineTo(wCenter + 58, wy);
      ctx.stroke();

      // 量子化分立基态能级 E1e 与 E1h 跃迁发光箭头
      const e1Y = wy + 58 - (8.5 - state.qdDiameterNm) * 5.2;
      const h1Y = e1Y + splitGap;
      ctx.strokeStyle = qdColor;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(wCenter - wellW / 2 + 4, e1Y);
      ctx.lineTo(wCenter + wellW / 2 - 4, e1Y);
      ctx.moveTo(wCenter - wellW / 2 + 4, h1Y);
      ctx.lineTo(wCenter + wellW / 2 - 4, h1Y);
      ctx.stroke();

      // 光子发射箭头
      ctx.beginPath();
      ctx.moveTo(wCenter, e1Y + 4);
      ctx.lineTo(wCenter, h1Y - 4);
      ctx.stroke();
      ctx.fillStyle = qdColor;
      ctx.font = "bold 11.5px sans-serif";
      ctx.fillText(`hν = ${qdEg.toFixed(2)} eV`, wCenter, h1Y + 24);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("异质结势阱 / 量子限制", wCenter, h1Y + 42);

      // 右半小图：UV 激发下的胶体量子点比色皿真实荧光光晕
      const vx = rx + rw * 0.75, vy = ry + 78;
      // 光晕
      const grad = ctx.createRadialGradient(vx, vy + 78, 8, vx, vy + 78, 72);
      grad.addColorStop(0, qdColor);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(vx, vy + 78, 72, 0, Math.PI * 2);
      ctx.fill();

      // 样品瓶与纳米球示意
      ctx.fillStyle = qdColor;
      ctx.globalAlpha = 0.78;
      ICChem.ui.drawRoundRect(ctx, vx - 28, vy + 24, 56, 110, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ICChem.ui.drawRoundRect(ctx, vx - 28, vy + 10, 56, 124, 6);
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`λ = ${qdLambda.toFixed(0)} nm`, vx, vy + 158);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px sans-serif";
      ctx.fillText(`量子点粒径 ${state.qdDiameterNm.toFixed(1)} nm`, vx, vy + 176);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { semiKey: "gan", qdDiameterNm: 3.6 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     5.3 工艺辅助材料（CMP抛光液/特气/超纯试剂）与封装材料热匹配 (ch5-process-pkg)
     ========================================================================== */
  ICChem.registerSim("ch5-process-pkg", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { oxidizerPct: 3.0, pressurePsi: 2.5, inhibitorBTA: 1.0, silicaFillerPct: 82 };
    const { resize } = ICChem.ui.createCanvas(viewport, 405);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "CMP 抛光液氧化剂/络合剂浓度（生成表面易磨软化膜）", min: 0.0, max: 8.0, step: 0.5, value: state.oxidizerPct, unit: " wt%",
          onInput: (v) => { state.oxidizerPct = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "CMP 抛光头下压力 P (Preston 机械作用)", min: 0.5, max: 6.0, step: 0.5, value: state.pressurePsi, unit: " psi",
          onInput: (v) => { state.pressurePsi = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "BTA 缓蚀剂浓度（保护凹槽铜线防蝶形凹陷 Dishing）", min: 0.0, max: 2.0, step: 0.2, value: state.inhibitorBTA, unit: " g/L",
          onInput: (v) => { state.inhibitorBTA = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "环氧塑封料(EMC)中球形 SiO₂ 微粉填充率（匹配硅 CTE 2.6 ppm/K）", min: 0, max: 90, step: 5, value: state.silicaFillerPct, unit: " wt%",
          onInput: (v) => { state.silicaFillerPct = v; }
        }).el
      );
    }

    function render() {
      tick += 0.06;
      // CMP 协同模型评估
      const mrr = 45 * Math.min(state.oxidizerPct + 0.3, state.pressurePsi * 1.4); // nm/min
      let cmpStatus = "化学-机械理想协同平坦化 ✓";
      let dishingNm = Math.max(4, (state.oxidizerPct * 12) / (0.3 + state.inhibitorBTA * 2.2));
      let scratchRisk = false;

      if (state.oxidizerPct < 0.8 && state.pressurePsi > 3.0) {
        cmpStatus = "缺化学软化膜：纯机械硬磨严重划伤!";
        scratchRisk = true;
      } else if (state.inhibitorBTA < 0.3 && state.oxidizerPct > 3.5) {
        cmpStatus = "缺缓蚀剂：铜沟槽发生严重蝶形凹陷(Dishing)!";
      }

      // 环氧塑封料 CTE 计算：纯环氧树脂 CTE ≈ 65 ppm/K，熔融石英微粉 ≈ 0.5 ppm/K；85~88 wt% 填充可降至 ~8 ppm/K
      const emcCTE = 65 * (1 - state.silicaFillerPct / 95) + 3.2;
      const warpage = (emcCTE - 2.6) * 0.65; // 相对翘曲度

      headerMetricsEl.textContent = "前道超净高纯辅助化学品 (金属杂质 < 10 ppt) + CMP 全局平坦化 + 后道封装热膨胀匹配";
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "CMP 去除速率 MRR", value: mrr.toFixed(0), unit: "nm/min", tone: "positive" },
        { label: "铜线蝶形凹陷量 Dishing", value: dishingNm.toFixed(1), unit: "nm", tone: dishingNm > 35 ? "danger" : "positive" },
        { label: "塑封料热膨胀系数 CTE", value: emcCTE.toFixed(1), unit: "ppm/K (Si=2.6)", tone: emcCTE < 14 ? "positive" : "warning" },
        { label: "CMP 表面质量诊断", value: scratchRisk ? "晶圆划伤报警!" : dishingNm > 35 ? "凹陷超标" : "纳米级镜面 ✓", tone: scratchRisk || dishingNm > 35 ? "danger" : "positive" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：Cu-CMP 化学机械抛光动态截面
      const lx = 40, ly = 36, lw = w * 0.53 - 52, lh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CMP 化学机械抛光：抛光垫 + 纳米磨料 + 氧化/缓蚀协同", lx + lw / 2, ly + 24);

      // 顶部旋转运动的多孔聚氨酯抛光垫
      const padY = ly + 56;
      ctx.fillStyle = "#475569";
      ctx.fillRect(lx + 24, padY, lw - 48, 28);
      // 抛光液纳米颗粒 (SiO2/Al2O3) 水平滑移
      for (let i = 0; i < 16; i++) {
        const px = lx + 30 + (((i * 34 + tick * 28) % (lw - 60)));
        ctx.beginPath();
        ctx.arc(px, padY + 36, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.fill();
      }

      // 下方大马士革铜互连沟槽截面
      const subY = padY + 52;
      // SiO2 介质层
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(lx + 24, subY, lw - 48, 130);
      // 两条镶嵌铜互连沟槽 (展示蝶形凹陷程度 dishingNm)
      [lx + lw * 0.3, lx + lw * 0.68].forEach((tx) => {
        const tw = 74;
        // Ta/TaN 阻挡层
        ctx.fillStyle = "#eab308";
        ctx.fillRect(tx - tw / 2 - 4, subY, tw + 8, 86);
        // 铜填充层
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(tx - tw / 2, subY, tw, 82);
        // 顶部蝶形凹陷弧坑
        const dishPx = Math.min(32, dishingNm * 0.45);
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
        ctx.beginPath();
        ctx.ellipse(tx, subY, tw / 2, dishPx, 0, 0, Math.PI);
        ctx.fill();

        // 若有 BTA 缓蚀分子保护膜，画绿色保护虚线
        if (state.inhibitorBTA >= 0.6) {
          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(tx, subY, tw / 2 - 2, dishPx, 0, 0, Math.PI);
          ctx.stroke();
        }
      });

      if (scratchRisk) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx + 65, subY + 2);
        ctx.lineTo(lx + 90, subY + 18);
        ctx.moveTo(lx + lw - 95, subY + 2);
        ctx.lineTo(lx + lw - 70, subY + 20);
        ctx.stroke();
      }

      ctx.fillStyle = scratchRisk || dishingNm > 35 ? "#fb7185" : "#34d399";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(cmpStatus, lx + lw / 2, ly + lh - 18);

      // 右侧：环氧塑封料 (EMC) 硅微粉填充与芯片封装冷热翘曲仿真
      const rx = w * 0.55, ry = 36, rw = w - rx - 30, rh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("封装结构材料：环氧塑封料硅微粉填充与热翘曲控制", rx + rw / 2, ry + 24);

      const pkgCx = rx + rw / 2, pkgCy = ry + 150, pkgW = rw - 72;
      const bend = Math.min(38, warpage * 0.85);

      // 绘制受热失配弯曲的塑封体 + 硅芯片 + 金/铜键合引线
      ctx.strokeStyle = "#334155";
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(pkgCx - pkgW / 2, pkgCy - 35 + bend);
      ctx.quadraticCurveTo(pkgCx, pkgCy - 35 - bend, pkgCx + pkgW / 2, pkgCy - 35 + bend);
      ctx.lineTo(pkgCx + pkgW / 2, pkgCy + 35 + bend);
      ctx.quadraticCurveTo(pkgCx, pkgCy + 35 - bend, pkgCx - pkgW / 2, pkgCy + 35 + bend);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 球形熔融 SiO2 微粉颗粒
      const fillerDots = Math.round(state.silicaFillerPct * 0.45);
      ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
      for (let i = 0; i < fillerDots; i++) {
        const fx = pkgCx - pkgW / 2 + 12 + ((i * 29) % (pkgW - 24));
        const fy = pkgCy - 22 + ((i * 19) % 44);
        ctx.beginPath();
        ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 中央硅裸芯片 Die + Au/Cu 键合引线 Wire Bond
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(pkgCx - 42, pkgCy - 6 - bend * 0.5, 84, 14);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pkgCx - 32, pkgCy - 6 - bend * 0.5);
      ctx.quadraticCurveTo(pkgCx - 58, pkgCy - 34 - bend * 0.5, pkgCx - 76, pkgCy + 8);
      ctx.moveTo(pkgCx + 32, pkgCy - 6 - bend * 0.5);
      ctx.quadraticCurveTo(pkgCx + 58, pkgCy - 34 - bend * 0.5, pkgCx + 76, pkgCy + 8);
      ctx.stroke();

      ctx.fillStyle = bend > 14 ? "#fbbf24" : "#34d399";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(
        bend > 14 ? `填充不足：CTE=${emcCTE.toFixed(1)} ppm/K 远大于硅，封装严重翘曲拉断引线！` : `高填充(${state.silicaFillerPct} wt% SiO₂)：CTE 逼近硅芯片，结构平直可靠 ✓`,
        pkgCx,
        ry + rh - 18
      );

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { oxidizerPct: 3.0, pressurePsi: 2.5, inhibitorBTA: 1.0, silicaFillerPct: 82 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     6.1 光刻光谱演进、瑞利分辨率/焦深与 DUV/EUV 光掩模材料 (ch6-optics-mask)
     ========================================================================== */
  ICChem.registerSim("ch6-optics-mask", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const sources = {
      gline: { name: "g-line 高压汞灯", lambda: 436, defaultNA: 0.54, maxNA: 0.60, mask: "石英玻璃透射式 + Cr遮光膜", color: "#818cf8", reflective: false },
      iline: { name: "i-line 高压汞灯", lambda: 365, defaultNA: 0.65, maxNA: 0.70, mask: "高纯合成石英透射版 + Cr/Cr₂O₃抗反膜", color: "#6366f1", reflective: false },
      krf: { name: "KrF 准分子激光", lambda: 248, defaultNA: 0.80, maxNA: 0.93, mask: "深紫外熔融石英透射版 + MoSi相移膜", color: "#38bdf8", reflective: false },
      arf_dry: { name: "ArF 干法准分子激光", lambda: 193, defaultNA: 0.93, maxNA: 0.93, mask: "无水合成石英 + CaF₂镜组 (空气 n=1.0)", color: "#2dd4bf", reflective: false },
      arf_imm: { name: "ArF-i 超纯水浸没式光刻", lambda: 193, defaultNA: 1.35, maxNA: 1.35, mask: "193nm透射掩模 + 镜头间充超纯水 (n=1.44 突破NA>1!)", color: "#06b6d4", reflective: false },
      euv: { name: "EUV 极紫外激光等离子体光源", lambda: 13.5, defaultNA: 0.33, maxNA: 0.55, mask: "高真空反射式：ULE超低膨胀基板 + 40对 Mo/Si 多层膜 + TaBN吸收体", color: "#f43f5e", reflective: true }
    };

    let state = { key: "arf_imm", NA: 1.35, k1: 0.28 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let slNA;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换集成电路光刻曝光光源代际（436 nm → 13.5 nm）",
          activeValue: state.key,
          fullSpan: true,
          options: [
            { label: "g-line (436nm)", value: "gline" },
            { label: "i-line (365nm)", value: "iline" },
            { label: "KrF (248nm)", value: "krf" },
            { label: "ArF干法 (193nm)", value: "arf_dry" },
            { label: "ArF浸没式 (193nm, NA=1.35)", value: "arf_imm" },
            { label: "EUV 极紫外 (13.5nm, High-NA)", value: "euv" }
          ],
          onChange: (k) => {
            state.key = k;
            state.NA = sources[k].defaultNA;
            buildControls();
            draw();
          }
        }).el
      );
      const src = sources[state.key];
      slNA = ICChem.ui.slider({
        label: "投影物镜数值孔径 NA = n·sinθ", min: 0.25, max: src.maxNA, step: 0.01, value: state.NA, unit: "",
        onInput: (v) => { state.NA = v; draw(); }
      });
      const slK1 = ICChem.ui.slider({
        label: "瑞利工艺因子 k₁（单次曝光理论极限 0.25）", min: 0.25, max: 0.65, step: 0.01, value: state.k1, unit: "",
        onInput: (v) => { state.k1 = v; draw(); }
      });
      controlsEl.appendChild(slNA.el);
      controlsEl.appendChild(slK1.el);
    }

    function draw() {
      const src = sources[state.key];
      const R = (state.k1 * src.lambda) / state.NA; // nm
      const DOF = (0.5 * src.lambda) / (state.NA * state.NA); // ± nm

      headerMetricsEl.textContent = `${src.name} (λ = ${src.lambda} nm) | 光掩模体系：${src.mask}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "曝光光源波长 λ", value: src.lambda, unit: "nm" },
        { label: "单次曝光极限分辨率 R", value: R.toFixed(1), unit: "nm", tone: "positive" },
        { label: "可用焦深裕度 DOF (±)", value: DOF.toFixed(0), unit: "nm", tone: DOF < 90 ? "warning" : "" },
        { label: "光掩模工作方式", value: src.reflective ? "真空反射式 (Mo/Si)" : "石英透射式 (SiO₂/Cr)", unit: "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：透射式 DUV 石英铬版 vs 反射式 EUV Mo/Si 多层膜掩模光路对比图
      const lx = 38, ly = 34, lw = w * 0.5 - 50, lh = h - 68;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      const cx = lx + lw / 2;
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";

      if (!src.reflective) {
        ctx.fillText("透射式光掩模光路 (DUV/UV 高纯合成石英基板)", cx, ly + 24);
        // 入射紫外光束
        ctx.fillStyle = src.color + "44";
        ctx.fillRect(cx - 88, ly + 42, 176, 36);
        // 高纯石英玻璃基板 (6.35 mm 缩尺)
        ctx.fillStyle = "rgba(186, 230, 253, 0.35)";
        ctx.fillRect(cx - 105, ly + 78, 210, 28);
        ctx.strokeStyle = "#7dd3fc";
        ctx.strokeRect(cx - 105, ly + 78, 210, 28);
        ctx.fillStyle = "#e0f2fe";
        ctx.font = "11px sans-serif";
        ctx.fillText("高纯合成石英基板 SiO₂ (高透光、极低热膨胀)", cx, ly + 96);

        // 铬遮光图案 Cr (70~100nm)
        ctx.fillStyle = "#334155";
        ctx.fillRect(cx - 95, ly + 106, 48, 10);
        ctx.fillRect(cx - 18, ly + 106, 36, 10);
        ctx.fillRect(cx + 47, ly + 106, 48, 10);

        // 穿过开口的衍射光与缩倍物镜
        ctx.fillStyle = src.color + "55";
        ctx.fillRect(cx - 47, ly + 116, 29, 55);
        ctx.fillRect(cx + 18, ly + 116, 29, 55);

        // 4:1 投影物镜椭圆
        ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
        ctx.beginPath();
        ctx.ellipse(cx, ly + 186, 95, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.stroke();

        // 若为浸没式 ArF-i，在镜头与晶圆之间绘制超纯水液滴 (n=1.44)!
        if (state.key === "arf_imm") {
          ctx.fillStyle = "rgba(6, 182, 212, 0.45)";
          ctx.fillRect(cx - 60, ly + 204, 120, 62);
          ctx.fillStyle = "#67e8f9";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText("193nm 浸没液：超纯水 UPW (n=1.44)", cx, ly + 238);
        } else {
          ctx.strokeStyle = src.color;
          ctx.beginPath();
          ctx.moveTo(cx - 65, ly + 204);
          ctx.lineTo(cx - 18, ly + 266);
          ctx.moveTo(cx + 65, ly + 204);
          ctx.lineTo(cx + 18, ly + 266);
          ctx.stroke();
        }

        // 底部涂胶硅晶圆
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(cx - 95, ly + 266, 190, 10);
        ctx.fillStyle = "#1e3a5f";
        ctx.fillRect(cx - 95, ly + 276, 190, 22);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("光刻胶 + 硅晶圆 (4:1 缩小成像)", cx, ly + 316);
      } else {
        ctx.fillText("EUV 高真空反射式光掩模 (13.5nm 被所有玻璃吸收!)", cx, ly + 24);
        // ULE 基板 + 40对 Mo/Si 布拉格反射多层膜
        const mx = cx - 105, my = ly + 56, mw = 210;
        ctx.fillStyle = "#334155";
        ctx.fillRect(mx, my, mw, 22);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "10.5px sans-serif";
        ctx.fillText("ULE 超低热膨胀基板", cx, my + 15);

        // 绘制交替纳米 Mo/Si 周期条纹
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#94a3b8";
          ctx.fillRect(mx, my + 22 + i * 5, mw, 5);
        }
        // TaBN 吸收体图案
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(cx - 75, my + 52, 46, 12);
        ctx.fillRect(cx + 25, my + 52, 50, 12);

        // 6° 斜入射极紫外光束与反射光束
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 80, ly + 245);
        ctx.lineTo(cx - 2, my + 52);
        ctx.lineTo(cx + 68, ly + 215);
        ctx.stroke();

        // 反射镜跳转至晶圆
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(cx + 42, ly + 215, 56, 8);
        ctx.beginPath();
        ctx.moveTo(cx + 68, ly + 215);
        ctx.lineTo(cx, ly + 270);
        ctx.stroke();

        ctx.fillStyle = "#e11d48";
        ctx.fillRect(cx - 90, ly + 270, 180, 10);
        ctx.fillStyle = "#1e3a5f";
        ctx.fillRect(cx - 90, ly + 280, 180, 20);
        ctx.fillStyle = "#fda4af";
        ctx.font = "11px sans-serif";
        ctx.fillText("40–50对 Mo/Si 多层膜布拉格相干反射 (反射率~70%)", cx, ly + 318);
      }

      // 右侧：分辨率 R 与焦深 DOF 随 NA 变化的权衡双曲线图
      const rx = w * 0.52, ry = 34, rw = w - rx - 30, rh = h - 68;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("瑞利判据权衡：增大 NA 提升分辨率 R，但急剧压缩焦深 DOF", rx + 14, ry + 24);

      const gx = rx + 44, gy = ry + 48, gw = rw - 68, gh = rh - 96;
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      const maxPlotY = Math.max(400, src.lambda * 2.5);
      const mapNA = (na) => gx + ((na - 0.25) / 1.15) * gw;
      const mapVal = (val) => gy + gh - Math.min(gh - 8, (val / maxPlotY) * (gh - 16));

      // R(NA) 实线
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let na = 0.25; na <= 1.38; na += 0.03) {
        const rVal = (state.k1 * src.lambda) / na;
        const x = mapNA(na), y = mapVal(rVal);
        if (na === 0.25) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // DOF(NA) 虚线
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let na = 0.25; na <= 1.38; na += 0.03) {
        const dofVal = (0.5 * src.lambda) / (na * na);
        const x = mapNA(na), y = mapVal(dofVal);
        if (na === 0.25) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 当前 NA 工作点标记
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(mapNA(state.NA), mapVal(R), 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(mapNA(state.NA), mapVal(DOF), 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "11.5px sans-serif";
      ctx.fillStyle = "#34d399";
      ctx.fillText(`● 实线：最小线宽 R = ${R.toFixed(1)} nm`, gx + 12, gy + 22);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`● 虚线：焦深裕度 DOF = ±${DOF.toFixed(0)} nm`, gx + 12, gy + 42);
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("数值孔径 NA (0.25 → 1.35) →", gx + gw / 2, gy + gh + 22);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { key: "arf_imm", NA: 1.35, k1: 0.28 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     6.2 光刻工艺九大核心步骤全流程交互仿真 (ch6-nine-steps)
     ========================================================================== */
  ICChem.registerSim("ch6-nine-steps", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const stepDefs = [
      { id: 1, short: "1.晶圆清洗", name: "步骤 1/9：晶圆标准湿法清洗 (RCA / 超纯水)", desc: "去除有机污染物、颗粒与金属离子，此时 SiO₂ 表面悬挂亲水硅羟基 (-Si-OH)，水接触角 < 15°。" },
      { id: 2, short: "2.HMDS预处理", name: "步骤 2/9：脱水烘烤与 HMDS 气相硅烷化增黏", desc: "150°C 脱水后通入六甲基二硅氮烷蒸汽，将表面亲水 -Si-OH 转化为疏水 -O-Si(CH₃)₃（接触角 ~75°），防止显影脱胶！" },
      { id: 3, short: "3.旋涂匀胶", name: "步骤 3/9：光刻胶旋转涂敷 (Spin Coating)", desc: "滴胶后高速旋转甩去多余光刻胶，膜厚 d ∝ 1/√ω，边缘同时喷 EBR 洗边剂去除晶圆边缘胶珠。" },
      { id: 4, short: "4.前烘SoftBake", name: "步骤 4/9：前烘 / 软烘 (Soft Bake, 90–110°C)", desc: "挥发胶膜中约 80%–90% 的有机溶剂 (PGMEA)，使胶膜固化定型、增强附着并消除旋涂内应力。" },
      { id: 5, short: "5.对准与曝光", name: "步骤 5/9：掩模套刻对准与紫外曝光 (Alignment & Exposure)", desc: "将掩模版与晶圆已有对准标记精密套准，紫外光透过掩模透明区引发光化学重排或光致产酸反应。" },
      { id: 6, short: "6.曝光后烘PEB", name: "步骤 6/9：曝光后烘烤 (PEB, Post-Exposure Bake)", desc: "热扩散平滑衬底反射造成的侧壁驻波条纹 (Standing Wave)，并在化学放大胶中驱动 H⁺ 催化脱保护反应！" },
      { id: 7, short: "7.显影Develop", name: "步骤 7/9：无金属离子碱性显影 (2.38% TMAH)", desc: "正性光刻胶曝光区溶于 0.26N TMAH 显影液被去除，把掩模光学潜像转化为三维立体光刻胶浮雕图形！" },
      { id: 8, short: "8.坚膜HardBake", name: "步骤 8/9：坚膜后烘 (Hard Bake, 120–140°C)", desc: "彻底去除残留水分与显影液，使高分子树脂适度热交联致密化，提升后续刻蚀与离子注入抗蚀性。" },
      { id: 9, short: "9.图形检测", name: "步骤 9/9：显影后图形检测 (ADI / CD-SEM & 套刻量测)", desc: "使用光学散射仪或临界尺寸扫描电镜 (CD-SEM) 无损检测关键线宽 CD、侧壁倾角及是否存在浮胶/桥连缺陷；不合格可剥胶返工！" }
    ];

    let state = { step: 7, useHMDS: true, spinRPM: 3000, softBakeC: 100, usePEB: true };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "点击切换光刻九大标准工序 (1 → 9)",
          activeValue: state.step,
          fullSpan: true,
          options: stepDefs.map((s) => ({ label: s.short, value: s.id })),
          onChange: (v) => { state.step = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "步骤3 匀胶转速 ω (d ∝ 1/√ω)", min: 1000, max: 6000, step: 500, value: state.spinRPM, unit: " rpm",
          onInput: (v) => { state.spinRPM = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "步骤4 前烘温度 t_SB (最佳 95–110°C)", min: 60, max: 160, step: 5, value: state.softBakeC, unit: " °C",
          onInput: (v) => { state.softBakeC = v; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "步骤2 HMDS 增黏预处理（故障注入实验）",
          activeValue: state.useHMDS ? "yes" : "no",
          options: [
            { label: "开启 HMDS (疏水强附着)", value: "yes" },
            { label: "漏做 HMDS (观测显影飘胶!)", value: "no" }
          ],
          onChange: (v) => { state.useHMDS = v === "yes"; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "步骤6 PEB 曝光后烘烤（故障注入实验）",
          activeValue: state.usePEB ? "yes" : "no",
          options: [
            { label: "开启 PEB (光滑垂直侧壁)", value: "yes" },
            { label: "跳过 PEB (观测驻波锯齿!)", value: "no" }
          ],
          onChange: (v) => { state.usePEB = v === "yes"; draw(); }
        }).el
      );
    }

    function draw() {
      const cur = stepDefs[state.step - 1];
      const thicknessUm = (82 / Math.sqrt(state.spinRPM)).toFixed(2);
      let diag = "工艺参数处于标准窗口内 ✓";
      let diagTone = "positive";

      if (!state.useHMDS && state.step >= 7) {
        diag = "严重缺陷：漏做 HMDS，显影液沿亲水界面钻蚀导致光刻胶线条整条剥离飘走！";
        diagTone = "danger";
      } else if (state.softBakeC > 135 && state.step >= 7) {
        diag = "前烘温度过高(>135°C)：感光剂热分解失效，曝光区无法正常显影清底！";
        diagTone = "danger";
      } else if (state.softBakeC < 75 && state.step >= 4) {
        diag = "前烘温度过低(<75°C)：胶膜残留大量溶剂，易粘掩模且暗腐蚀严重！";
        diagTone = "warning";
      } else if (!state.usePEB && state.step >= 7) {
        diag = "跳过 PEB：光刻胶侧壁出现明显干涉驻波锯齿波纹 (Standing Waves)！";
        diagTone = "warning";
      }

      headerMetricsEl.textContent = cur.name;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "当前光刻工序", value: `${state.step} / 9`, unit: cur.short.slice(2) },
        { label: "旋涂胶膜厚度 d", value: thicknessUm, unit: "μm" },
        { label: "晶圆表面水接触角", value: state.step >= 2 && state.useHMDS ? "76° (疏水亲胶)" : "12° (亲水硅羟基)", unit: "" },
        { label: "形貌良率诊断", value: diagTone === "positive" ? "形貌优良 ✓" : diagTone === "warning" ? "侧壁/溶剂异常" : "图形失效 ✕", tone: diagTone }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const waferW = Math.min(620, w - 90);
      const wx = cx - waferW / 2;
      const subY = 258;

      // 顶部步骤描述横条
      ctx.fillStyle = "rgba(15,23,42,0.9)";
      ICChem.ui.drawRoundRect(ctx, 36, 20, w - 72, 58, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.35)";
      ctx.stroke();
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(cur.name, 52, 42);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      ctx.fillText(cur.desc, 52, 63);

      // 硅衬底 + SiO2 薄膜层
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(wx, subY + 22, waferW, 56);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(wx, subY, waferW, 22);
      ctx.fillStyle = "#e0f2fe";
      ctx.font = "11.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SiO₂ 待图形化薄膜层 / 单晶硅晶圆 (Si Substrate)", cx, subY + 54);

      // 步骤 1: 表面 -OH 基团与清洗水雾
      if (state.step === 1) {
        ctx.fillStyle = "#38bdf8";
        for (let x = wx + 30; x < wx + waferW - 20; x += 48) {
          ctx.fillText("-OH", x, subY - 8);
        }
      }

      // 步骤 2+: HMDS 单分子层
      if (state.step >= 2 && state.useHMDS) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(wx, subY - 5, waferW, 5);
        if (state.step === 2) {
          ctx.fillText("HMDS 疏水单分子增黏层 -O-Si(CH₃)₃", cx, subY - 16);
        }
      }

      // 光刻胶视觉像素高度
      const resistH = Math.max(36, Math.min(98, (82 / Math.sqrt(state.spinRPM)) * 44));
      const rTop = subY - (state.useHMDS && state.step >= 2 ? 5 : 0) - resistH;

      if (state.step >= 3 && state.step <= 6) {
        // 连续胶膜
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(wx, rTop, waferW, resistH);

        // 步骤5/6 曝光潜像区变色
        if (state.step >= 5) {
          const expZones = [
            [wx + waferW * 0.22, waferW * 0.18],
            [wx + waferW * 0.60, waferW * 0.18]
          ];
          expZones.forEach(([zx, zw]) => {
            ctx.fillStyle = state.step === 5 ? "rgba(251, 191, 36, 0.55)" : "rgba(251, 191, 36, 0.78)";
            ctx.fillRect(zx, rTop, zw, resistH);
          });

          if (state.step === 5) {
            // 绘制上方光掩模与紫外曝光束
            const maskY = 98;
            ctx.fillStyle = "rgba(186,230,253,0.35)";
            ctx.fillRect(wx, maskY, waferW, 14);
            ctx.fillStyle = "#334155";
            ctx.fillRect(wx, maskY + 14, waferW * 0.22, 8);
            ctx.fillRect(wx + waferW * 0.40, maskY + 14, waferW * 0.20, 8);
            ctx.fillRect(wx + waferW * 0.78, maskY + 14, waferW * 0.22, 8);

            expZones.forEach(([zx, zw]) => {
              ctx.fillStyle = "rgba(168, 85, 247, 0.25)";
              ctx.fillRect(zx, maskY + 22, zw, rTop - (maskY + 22));
            });
          }
        }

        if (state.step === 4 || state.step === 6) {
          // 底部加热台热浪箭头
          ctx.fillStyle = "#fb923c";
          ctx.fillRect(wx - 10, subY + 80, waferW + 20, 12);
          ctx.fillText(state.step === 4 ? `前烘加热台 (${state.softBakeC}°C)：PGMEA 溶剂挥发 ↑` : "PEB 加热台：酸催化脱保护与驻波热平滑 ↑", cx, rTop - 14);
        }
      } else if (state.step >= 7) {
        // 显影后保留的三段正胶凸起线条 (wx..0.22, 0.40..0.60, 0.78..1.0)
        const blocks = [
          { x: wx, w: waferW * 0.22 },
          { x: wx + waferW * 0.40, w: waferW * 0.20 },
          { x: wx + waferW * 0.78, w: waferW * 0.22 }
        ];

        // 若前烘温度过高热分解，曝光区残留底膜清不干净！
        if (state.softBakeC > 135) {
          ctx.fillStyle = "rgba(225, 29, 72, 0.65)";
          ctx.fillRect(wx, subY - resistH * 0.45, waferW, resistH * 0.45);
        }

        blocks.forEach((b, idx) => {
          ctx.save();
          // 若漏做 HMDS，中间那条微细光刻胶发生倾斜飘浮脱胶！
          if (!state.useHMDS && idx === 1) {
            ctx.translate(b.x + b.w / 2, rTop + resistH);
            ctx.rotate(-0.28);
            ctx.fillStyle = "#e11d48";
            ctx.fillRect(-b.w / 2, -resistH - 18, b.w, resistH);
            ctx.restore();
            return;
          }

          ctx.fillStyle = state.step >= 8 ? "#be123c" : "#e11d48";
          if (!state.usePEB) {
            // 绘制无 PEB 时的侧壁驻波锯齿波纹！
            ctx.beginPath();
            ctx.moveTo(b.x, rTop);
            ctx.lineTo(b.x + b.w, rTop);
            for (let y = rTop; y <= rTop + resistH; y += 6) {
              const ripple = Math.sin((y - rTop) * 0.65) * 4.5;
              ctx.lineTo(b.x + b.w + ripple, y);
            }
            ctx.lineTo(b.x, rTop + resistH);
            for (let y = rTop + resistH; y >= rTop; y -= 6) {
              const ripple = Math.sin((y - rTop) * 0.65) * 4.5;
              ctx.lineTo(b.x - ripple, y);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(b.x, rTop, b.w, resistH);
          }
          ctx.restore();
        });

        // 步骤 9: 绘制 CD-SEM 电子束扫描测量卡尺
        if (state.step === 9 && state.useHMDS) {
          const midB = blocks[1];
          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(midB.x, rTop - 22);
          ctx.lineTo(midB.x, rTop - 4);
          ctx.moveTo(midB.x + midB.w, rTop - 22);
          ctx.lineTo(midB.x + midB.w, rTop - 4);
          ctx.moveTo(midB.x, rTop - 13);
          ctx.lineTo(midB.x + midB.w, rTop - 13);
          ctx.stroke();
          ctx.fillStyle = "#34d399";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("CD-SEM 实测关键尺寸合格 ✓", midB.x + midB.w / 2, rTop - 28);
        }
      }

      // 底部工艺状态诊断提示条
      ctx.fillStyle = diagTone === "positive" ? "#34d399" : diagTone === "warning" ? "#fbbf24" : "#fb7185";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(diag, cx, h - 18);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { step: 7, useHMDS: true, spinRPM: 3000, softBakeC: 100, usePEB: true };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     6.3 正性/负性光刻胶化学机理、对比度曲线与配套试剂安全 (ch6-resist-chem)
     ========================================================================== */
  ICChem.registerSim("ch6-resist-chem", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const systems = {
      dnq: {
        name: "g/i-line 正性光刻胶 (DNQ-Novolac 酚醛树脂体系)",
        type: "pos",
        e0: 85, // mJ/cm2 clearing dose
        gamma: 2.8,
        resin: "间甲酚-甲醛线型酚醛树脂 (Novolac)",
        photoActive: "重氮萘醌磺酸酯 (DNQ，未曝光时强疏水阻溶；曝光后 Wolff 重排生成亲水茚羧酸！)",
        dev: "2.38% TMAH 水溶液（碱性中和羧酸高速溶解曝光区）",
        quantumYield: "0.2–0.3 (无化学放大，需较高曝光剂量)"
      },
      car: {
        name: "DUV/EUV 化学放大正性光刻胶 (CAR 催化脱保护体系)",
        type: "pos",
        e0: 18, // 高灵敏度低剂量!
        gamma: 5.5,
        resin: "对羟基苯乙烯或脂环族丙烯酸酯共聚物（侧链挂酸敏疏水保护基 -tBOC）",
        photoActive: "光致产酸剂 PAG（如三苯基锍盐，吸收1个光子产生强酸 H⁺，PEB时循环催化上百次脱保护！）",
        dev: "2.38% TMAH 无金属离子显影液",
        quantumYield: "有效催化链长 100–500 (灵敏度极高，对比度陡峭!)"
      },
      neg: {
        name: "交联型负性光刻胶 (如环氧基 SU-8 / 叠氮橡胶体系)",
        type: "neg",
        e0: 45, // gel dose
        gamma: 2.4,
        resin: "多官能度双酚A酚醛环氧预聚物 (SU-8) 或聚异戊二烯",
        photoActive: "光引发剂/光生酸引发环氧基团开环聚合，形成三维不溶体型交联网状高分子！",
        dev: "PGMEA 有机溶剂或专用显影液（溶解未曝光线性小分子，曝光交联区保留）",
        quantumYield: "链式交联增重（耐酸碱极强，适合厚胶MEMS，但易溶胀）"
      }
    };

    let state = { sysKey: "car", dose: 26 };
    const { resize } = ICChem.ui.createCanvas(viewport, 405);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择光刻胶光化学体系",
          activeValue: state.sysKey,
          fullSpan: true,
          options: [
            { label: "DUV/EUV 化学放大正胶 (CAR)", value: "car" },
            { label: "g/i-line 经典正胶 (DNQ-酚醛)", value: "dnq" },
            { label: "交联型负性光刻胶 (SU-8)", value: "neg" }
          ],
          onChange: (k) => {
            state.sysKey = k;
            state.dose = k === "dnq" ? 105 : k === "car" ? 26 : 65;
            buildControls();
            draw();
          }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "紫外曝光剂量 E (Exposure Dose)", min: 2, max: 180, step: 2, value: state.dose, unit: " mJ/cm²", fullSpan: true,
          onInput: (v) => { state.dose = v; draw(); }
        }).el
      );
    }

    function getRemainThickness(sys, E) {
      if (sys.type === "pos") {
        // Sigmoidal drop around e0
        const v = 1 / (1 + Math.pow(E / sys.e0, sys.gamma * 2.2));
        return v < 0.03 ? 0 : v;
      } else {
        // Negative resist: 0 below gel dose, rises toward 1 above e0
        if (E < sys.e0 * 0.45) return 0;
        return Math.min(1, 1 - 1 / (1 + Math.pow(E / sys.e0, sys.gamma * 2.0)));
      }
    }

    function draw() {
      const sys = systems[state.sysKey];
      const rem = getRemainThickness(sys, state.dose);

      headerMetricsEl.textContent = `${sys.name}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "光刻胶极性", value: sys.type === "pos" ? "正性胶 (曝光溶除)" : "负性胶 (曝光交联保留)", unit: "" },
        { label: "特征阈值剂量 E₀ / Eg", value: sys.e0, unit: "mJ/cm²" },
        { label: "对比度陡峭度 γ", value: sys.gamma.toFixed(1), unit: "", tone: sys.gamma > 4 ? "positive" : "" },
        { label: "当前曝光区显影留膜率", value: (rem * 100).toFixed(1), unit: "%", tone: (sys.type === "pos" && rem === 0) || (sys.type === "neg" && rem > 0.85) ? "positive" : "warning" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：光刻胶对比度特征曲线 (Normalized Remaining Thickness vs log E)
      const lx = 48, ly = 36, lw = w * 0.48 - 60, lh = h - 76;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("显影留膜率对比度曲线 (NRT vs lg E)", lx + 14, ly + 24);

      const gx = lx + 38, gy = ly + 46, gw = lw - 58, gh = lh - 88;
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      const mapX = (eVal) => gx + ((Math.log10(Math.max(2, eVal)) - Math.log10(2)) / (Math.log10(180) - Math.log10(2))) * gw;
      const mapY = (nrt) => gy + gh - nrt * (gh - 16) - 8;

      ctx.strokeStyle = sys.type === "pos" ? "#38bdf8" : "#f43f5e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let e = 2; e <= 180; e += 2) {
        const x = mapX(e), y = mapY(getRemainThickness(sys, e));
        if (e === 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 当前剂量点
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(mapX(state.dose), mapY(rem), 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("对数曝光剂量 lg E (2 → 180 mJ/cm²) →", gx + gw / 2, gy + gh + 22);

      // 右侧：分子级反应机理可视化 + GHS 化学品安全卡
      const rx = w * 0.5 + 8, ry = 36, rw = w * 0.5 - 34, rh = h - 76;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("高分子链化学转化与配套试剂安全规范", rx + rw / 2, ry + 24);

      // 绘制高分子链网络状态（线性阻溶 vs 脱保护亲水 vs 三维交联网络）
      const mx = rx + 26, my = ry + 48, mw = rw - 52, mh = 128;
      ctx.fillStyle = "#0b1424";
      ctx.fillRect(mx, my, mw, mh);

      const reacted = state.dose >= sys.e0 * 0.85;
      for (let i = 0; i < 4; i++) {
        const py = my + 24 + i * 26;
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mx + 20, py);
        ctx.bezierCurveTo(mx + mw * 0.35, py - 10, mx + mw * 0.65, py + 10, mx + mw - 20, py);
        ctx.stroke();

        // 侧基或交联桥键
        for (let k = 1; k <= 5; k++) {
          const kx = mx + (mw * k) / 6;
          if (sys.type === "pos") {
            ctx.fillStyle = reacted ? "#34d399" : "#fbbf24";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(reacted ? "-COOH/-OH(碱溶)" : "疏水保护基", kx, py - 5);
          } else if (reacted && i < 3) {
            // 负胶纵向交联共价桥键！
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(kx, py);
            ctx.lineTo(kx + 6, py + 26);
            ctx.stroke();
          }
        }
      }

      // 下方文字解析与 GHS 安全警示
      ctx.textAlign = "left";
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11.5px sans-serif";
      ctx.fillText(`• 成膜树脂：${sys.resin}`, rx + 20, my + mh + 24);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px sans-serif";
      ctx.fillText(`• 量子/放大效率：${sys.quantumYield}`, rx + 20, my + mh + 44);
      ctx.fillText(`• 配套显影液：${sys.dev}`, rx + 20, my + mh + 64);

      ctx.fillStyle = "rgba(251, 113, 133, 0.15)";
      ICChem.ui.drawRoundRect(ctx, rx + 18, my + mh + 78, rw - 36, 48, 6);
      ctx.fill();
      ctx.fillStyle = "#fda4af";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("⚠️ 实验室安全：TMAH 具强经皮吸收毒性，PGMEA/洗边剂易燃！", rx + 28, my + mh + 96);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10.5px sans-serif";
      ctx.fillText("必须在黄光排风通风橱操作，佩戴双层丁腈手套与护目镜，废液分类回收。", rx + 28, my + mh + 114);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { sysKey: "car", dose: 26 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });
})();
