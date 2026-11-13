/* ==========================================================================
   《集成工艺化学》交互仿真引擎 — 第三章(金属材料3例) & 第四章(非金属与半导体3例)
   ========================================================================== */

(function () {
  const ICChem = window.ICChem;

  /* ==========================================================================
     3.1 金属分类、过渡金属特性与酸碱/水/氧反应实验台 (ch3-metals)
     ========================================================================== */
  ICChem.registerSim("ch3-metals", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const metals = {
      fe: {
        symbol: "Fe", name: "铁 (Iron)", category: "黑色金属 (Fe/Cr/Mn)",
        rho: 7.87, mp: 1538, res: 9.71, config: "[Ar] 3d⁶ 4s²", color: "#94a3b8",
        icRole: "引线框架合金 (Fe-42Ni Alloy 42)，前道硅片严格管控之禁入重金属杂质",
        rxns: {
          o2: { rate: 0.4, gas: null, passivate: false, desc: "潮湿空气中缓慢氧化生锈，高温生成 Fe₃O₄" },
          h2o: { rate: 0.05, gas: null, passivate: false, desc: "常温纯水中几乎不反应，高温水蒸气生成 Fe₃O₄ + H₂" },
          hcl: { rate: 0.75, gas: "H₂↑", passivate: false, solColor: "rgba(134,239,172,0.28)", desc: "Fe + 2H⁺ → Fe²⁺(浅绿) + H₂↑（置换反应）" },
          hno3_conc: { rate: 0.0, gas: null, passivate: true, desc: "冷浓硝酸使铁表面瞬间生成致密氧化膜发生【钝化】！" },
          tmah: { rate: 0.0, gas: null, passivate: false, desc: "铁非两性金属，常温不溶于 NaOH 或 TMAH 碱液" }
        }
      },
      al: {
        symbol: "Al", name: "铝 (Aluminum)", category: "有色金属 · 轻金属 (ρ < 4.5)",
        rho: 2.70, mp: 660, res: 2.65, config: "[Ne] 3s² 3p¹", color: "#e2e8f0",
        icRole: "经典芯片后道铝互连线、ワイヤ键合铝丝与焊盘 (Pad)",
        rxns: {
          o2: { rate: 0.1, gas: null, passivate: true, desc: "常温迅速生成数纳米致密 Al₂O₃ 自钝化保护膜" },
          h2o: { rate: 0.0, gas: null, passivate: true, desc: "表面致密 Al₂O₃ 阻隔常温纯水腐蚀" },
          hcl: { rate: 0.9, gas: "H₂↑", passivate: false, solColor: "rgba(226,232,240,0.18)", desc: "2Al + 6H⁺ → 2Al³⁺ + 3H₂↑（剧烈溶解产氢）" },
          hno3_conc: { rate: 0.0, gas: null, passivate: true, desc: "冷浓硝酸使铝表面强烈【钝化】，可用铝槽车盛装浓硝酸！" },
          tmah: { rate: 0.88, gas: "H₂↑", passivate: false, solColor: "rgba(56,189,248,0.22)", desc: "【两性金属腐蚀警告】2Al + 2OH⁻ + 6H₂O → 2[Al(OH)₄]⁻ + 3H₂↑（TMAH显影液会腐蚀裸露铝焊盘！）" }
        }
      },
      cu: {
        symbol: "Cu", name: "铜 (Copper)", category: "有色金属 · 重金属",
        rho: 8.96, mp: 1085, res: 1.68, config: "[Ar] 3d¹⁰ 4s¹", color: "#fb923c",
        icRole: "先进逻辑芯片大马士革多层超低阻铜互连线、RDL 重布线与键合铜线",
        rxns: {
          o2: { rate: 0.35, gas: null, passivate: false, desc: "空气受热极易表面氧化生成 Cu₂O / CuO（无自钝化保护性！）" },
          h2o: { rate: 0.0, gas: null, passivate: false, desc: "不与纯水反应（电极电势 E° = +0.34V > 0）" },
          hcl: { rate: 0.0, gas: null, passivate: false, desc: "无氧条件下不与非氧化性稀盐酸反应" },
          hno3_conc: { rate: 0.95, gas: "NO₂↑(红棕)", passivate: false, solColor: "rgba(56,189,248,0.48)", desc: "Cu + 4HNO₃(浓) → Cu(NO₃)₂(蓝) + 2NO₂↑ + 2H₂O（氧化性酸剧烈溶解！）" },
          tmah: { rate: 0.0, gas: null, passivate: false, desc: "单质铜不溶于强碱，但在含氨/有机胺络合剂+氧时会被络合微蚀" }
        }
      },
      w: {
        symbol: "W", name: "钨 (Tungsten)", category: "有色金属 · 稀有高熔点过渡金属",
        rho: 19.25, mp: 3422, res: 5.28, config: "[Xe] 4f¹⁴ 5d⁴ 6s²", color: "#64748b",
        icRole: "接触孔钨塞 (Contact W-Plug) 与 3D NAND 字线金属（全金属最高熔点 3422°C）",
        rxns: {
          o2: { rate: 0.05, gas: null, passivate: true, desc: "常温极稳定，500°C 以上高温才明显氧化为 WO₃" },
          h2o: { rate: 0.0, gas: null, passivate: false, desc: "常温对水完全惰性" },
          hcl: { rate: 0.0, gas: null, passivate: false, desc: "耐稀盐酸、稀硫酸腐蚀" },
          hno3_conc: { rate: 0.05, gas: null, passivate: true, desc: "表面生成 WO₃ 氧化膜而耐单酸，仅溶于 HF+HNO₃ 混酸或 H₂O₂ 湿法刻蚀液" },
          tmah: { rate: 0.08, gas: null, passivate: false, desc: "常温纯碱中极慢，配合 H₂O₂ 氧化剂可转化为 WO₄²⁻ 进行湿法去钨" }
        }
      },
      pt: {
        symbol: "Pt", name: "铂 (Platinum)", category: "有色金属 · 贵金属",
        rho: 21.45, mp: 1768, res: 10.6, config: "[Xe] 4f¹⁴ 5d⁹ 6s¹", color: "#f8fafc",
        icRole: "光电芯片欧姆接触电极、铁电存储器电极与镍铂硅化物 (NiPtSi)",
        rxns: {
          o2: { rate: 0.0, gas: null, passivate: false, desc: "高温下亦不被空气氧化，化学惰性极高" },
          h2o: { rate: 0.0, gas: null, passivate: false, desc: "不反应" },
          hcl: { rate: 0.0, gas: null, passivate: false, desc: "不溶于任何单一无机强酸" },
          hno3_conc: { rate: 0.0, gas: null, passivate: false, desc: "不溶于浓硝酸！仅溶于【王水 (浓HCl:浓HNO₃=3:1)】生成 H₂[PtCl₆]" },
          tmah: { rate: 0.0, gas: null, passivate: false, desc: "对强碱完全惰性" }
        }
      }
    };

    let state = { metal: "al", reagent: "tmah" };
    const { resize } = ICChem.ui.createCanvas(viewport, 400);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择金属样品（对比黑色金属与四大类有色金属）",
          activeValue: state.metal,
          fullSpan: true,
          options: Object.entries(metals).map(([k, m]) => ({ label: `${m.symbol} ${m.name.split(" ")[0]}`, value: k })),
          onChange: (k) => { state.metal = k; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择作用化学环境 / 试剂",
          activeValue: state.reagent,
          fullSpan: true,
          options: [
            { label: "NaOH / TMAH 显影强碱液", value: "tmah" },
            { label: "稀盐酸 HCl (非氧化性酸)", value: "hcl" },
            { label: "冷浓硝酸 HNO₃ (钝化/强氧化)", value: "hno3_conc" },
            { label: "空气 / O₂", value: "o2" },
            { label: "超纯水 H₂O", value: "h2o" }
          ],
          onChange: (r) => { state.reagent = r; }
        }).el
      );
    }

    function render() {
      tick += 0.05;
      const m = metals[state.metal];
      const rxn = m.rxns[state.reagent];

      headerMetricsEl.textContent = `${m.name} | 分类：${m.category} | 价电子构型：${m.config}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "金属工业分类", value: m.category.split("·").pop().trim(), unit: "" },
        { label: "20°C 电阻率 ρ", value: m.res, unit: "μΩ·cm", tone: m.res < 3 ? "positive" : "" },
        { label: "熔点 Tm / 密度", value: `${m.mp}°C / ${m.rho}`, unit: "g/cm³" },
        { label: "当前试剂作用状态", value: rxn.passivate ? "表面致密钝化 🛡️" : rxn.rate > 0.3 ? "发生显著腐蚀 ⚡" : "稳定耐蚀 ✓", tone: rxn.rate > 0.3 ? "danger" : "positive" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：实验烧杯浸泡金属片动画
      const bx = w * 0.24, by = 52, bw = 190, bh = 258;
      ctx.fillStyle = rxn.solColor || "rgba(56, 189, 248, 0.12)";
      ctx.fillRect(bx - bw / 2, by + 48, bw, bh - 48);

      // 金属试片
      const stripW = 48 - (rxn.rate > 0.5 ? (Math.sin(tick * 0.5) * 0.5 + 0.5) * 6 : 0);
      ctx.fillStyle = m.color;
      ctx.fillRect(bx - stripW / 2, by + 22, stripW, bh - 52);

      // 若发生钝化，绘制金色发光致密保护氧化壳
      if (rxn.passivate) {
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(bx - stripW / 2 - 2, by + 48, stripW + 4, bh - 78);
      }

      // 若产生气体（H2 或红棕色 NO2）绘制气泡上浮
      if (rxn.gas) {
        const isNO2 = rxn.gas.includes("NO₂");
        for (let i = 0; i < 20; i++) {
          const px = bx - 34 + ((i * 19) % 68);
          const py = by + bh - 34 - ((tick * 42 + i * 17) % (bh - 86));
          ctx.beginPath();
          ctx.arc(px, py, isNO2 ? 4.2 : 3.4, 0, Math.PI * 2);
          ctx.fillStyle = isNO2 ? "rgba(234, 88, 12, 0.78)" : "rgba(248, 250, 252, 0.82)";
          ctx.fill();
        }
        ctx.fillStyle = isNO2 ? "#fb923c" : "#38bdf8";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`逸出气体：${rxn.gas}`, bx, by + 14);
      }

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2, by);
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(m.symbol, bx, by + 145);

      // 右侧：材料档案卡与反应化学机理
      const rx = w * 0.46, rw = w - rx - 30;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, rx, 48, rw, 290, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.32)";
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(`${m.name} — 物理化学档案`, rx + 20, 80);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12.5px sans-serif";
      ctx.fillText(`• 冶金分类：${m.category}`, rx + 20, 112);
      ctx.fillText(`• 价层电子构型：${m.config}`, rx + 20, 138);
      ctx.fillText(`• 芯片核心用途：${m.icRole}`, rx + 20, 164);

      ctx.fillStyle = rxn.rate > 0.3 ? "rgba(251,113,133,0.14)" : "rgba(52,211,153,0.13)";
      ICChem.ui.drawRoundRect(ctx, rx + 18, 192, rw - 36, 122, 8);
      ctx.fill();

      ctx.fillStyle = rxn.rate > 0.3 ? "#fb7185" : "#34d399";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("实验现象与化学反应解析：", rx + 30, 218);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "12.5px sans-serif";
      // 自动简易换行
      const words = rxn.desc;
      const lineLen = Math.max(22, Math.floor((rw - 65) / 13));
      for (let i = 0; i < Math.ceil(words.length / lineLen); i++) {
        ctx.fillText(words.slice(i * lineLen, (i + 1) * lineLen), rx + 30, 246 + i * 22);
      }

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { metal: "al", reagent: "tmah" };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     3.2 钛及其化合物 (Ti/TiN/TiO2) 与稀土元素光电/高k应用 (ch3-ti-ree)
     ========================================================================== */
  ICChem.registerSim("ch3-ti-ree", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const items = {
      tin: {
        group: "钛及其重要化合物",
        name: "Ti / TiN 氮化钛阻挡层与金属栅",
        formula: "Ti / TiN",
        val: "Ti (+3/+4), [Ar] 3d² 4s²",
        metric1: ["比强度/耐蚀性", "极高 (TiO₂钝化)"],
        metric2: ["TiN 薄膜电阻率", "~30–70 μΩ·cm"],
        metric3: ["晶圆核心工艺", "ALD/PVD 阻挡层 & PMOS功函数层"],
        color: "#fbbf24",
        desc: "金属钛质轻高强耐王水（但溶于HF）。金黄色的氮化钛（TiN）兼具高熔点（2930°C）、优良导电性与化学阻挡性，用于阻挡 Cu/WF₆ 中氟或铜向硅衬底扩散！"
      },
      tio2: {
        group: "钛及其重要化合物",
        name: "TiO₂ 二氧化钛（光催化 / 高折射率光学膜）",
        formula: "TiO₂ (金红石型)",
        val: "Ti⁴⁺ (3d⁰)",
        metric1: ["光学折射率 n", "2.5 – 2.7"],
        metric2: ["禁带宽度 Eg", "3.0 – 3.2 eV"],
        metric3: ["光电芯片用途", "增透/高反介质膜、DRAM高k电容介质"],
        color: "#38bdf8",
        desc: "TiO₂ 化学性质极其稳定、折射率高（n≈2.6），广泛用于光电芯片多层光学干涉滤光膜、光催化自清洁及高介电常数（k≈40–80）存储介质。"
      },
      ceo2: {
        group: "稀土元素及应用 (17种: La–Lu + Sc, Y)",
        name: "CeO₂ 氧化铈（STI 浅沟槽隔离 CMP 抛光磨料）",
        formula: "CeO₂ (铈 Z=58)",
        val: "Ce³⁺ ⇌ Ce⁴⁺ 变价活性",
        metric1: ["Ce 特征化合价", "+3 / +4 共存"],
        metric2: ["SiO₂/Si₃N₄ 抛光选择比", "> 30 : 1"],
        metric3: ["芯片工艺角色", "STI CMP 化学齿合高效磨料"],
        color: "#34d399",
        desc: "铈是丰度最高的稀土元素，Ce³⁺/Ce⁴⁺ 表面氧化还原位点能与晶圆 SiO₂ 形成 Si-O-Ce 化学键并选择性快速剥离 SiO₂，同时在 Si₃N₄ 阻挡层上自动停止！"
      },
      er: {
        group: "稀土元素及应用 (17种: La–Lu + Sc, Y)",
        name: "Er³⁺ 掺铒光纤/波导激光放大器 (1550 nm)",
        formula: "Er³⁺ (铒 Z=68)",
        val: "[Xe] 4f¹¹ (特征 +3 价)",
        metric1: ["f–f 受激发射波长", "1550 nm (C波段)"],
        metric2: ["石英光纤损耗最低点", "0.18 dB/km"],
        metric3: ["光电芯片角色", "EDFA 光通信放大器 & 硅基掺铒光源"],
        color: "#f472b6",
        desc: "稀土离子内层 4f 电子受外层 5s²5p⁶ 电子壳层屏蔽，受晶体场干扰极小，能级跃迁谱线尖锐！Er³⁺ 的 ⁴I₁₃/₂ → ⁴I₁₅/₂ 跃迁精准落在 1550 nm 光纤通信最低损耗窗口！"
      },
      la2o3: {
        group: "稀土元素及应用 (17种: La–Lu + Sc, Y)",
        name: "La₂O₃ / Y₂O₃ 高 k 栅介质偶极子调控层",
        formula: "La₂O₃ (镧 Z=57)",
        val: "La³⁺ (4f⁰, 镧系起始)",
        metric1: ["相对介电常数 k", "~24 – 27 (远高于SiO₂ 3.9)"],
        metric2: ["光学带隙 Eg", "~5.5 eV"],
        metric3: ["FinFET/GAA 角色", "HfO₂ 基高k栅界面偶极子调阈值电压 Vt"],
        color: "#a78bfa",
        desc: "随着镧系原子序数从 La(57) 到 Lu(71) 递增，原子/离子半径缓慢缩小的现象称为【镧系收缩】（使 Hf 与 Zr 半径几乎相等！）。La₂O₃ 覆盖在 HfO₂ 上形成界面偶极子，精准降低 NMOS 晶体管阈值电压！"
      }
    };

    let state = { key: "tin" };
    const { resize } = ICChem.ui.createCanvas(viewport, 395);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择钛基化合物或稀土功能材料案例",
          activeValue: state.key,
          fullSpan: true,
          options: [
            { label: "Ti / TiN 扩散阻挡层", value: "tin" },
            { label: "TiO₂ 光学/高k介质", value: "tio2" },
            { label: "稀土 CeO₂ (CMP抛光)", value: "ceo2" },
            { label: "稀土 Er³⁺ (1550nm光通信)", value: "er" },
            { label: "稀土 La₂O₃ (镧系收缩/高k栅)", value: "la2o3" }
          ],
          onChange: (k) => { state.key = k; draw(); }
        }).el
      );
    }

    function draw() {
      const it = items[state.key];
      headerMetricsEl.textContent = `${it.group} | ${it.formula} (${it.val})`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "核心化学组成", value: it.formula, unit: "" },
        { label: it.metric1[0], value: it.metric1[1], unit: "", tone: "positive" },
        { label: it.metric2[0], value: it.metric2[1], unit: "" },
        { label: "微纳制造定位", value: it.metric3[1].slice(0, 12), unit: "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧绘制镧系收缩离子半径曲线 (La3+ -> Lu3+) + Ti 叠层对照
      const lx = 50, ly = 42, lw = w * 0.48 - 64, lh = h - 86;
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("镧系收缩曲线：Ln³⁺ 离子半径随原子序数递减 (pm)", lx + 14, ly + 24);

      const lnData = [
        ["La", 103.2], ["Ce", 101], ["Pr", 99], ["Nd", 98.3], ["Sm", 95.8],
        ["Eu", 94.7], ["Gd", 93.8], ["Dy", 91.2], ["Er", 89.0], ["Yb", 86.8], ["Lu", 86.1]
      ];
      const gx = lx + 36, gy = ly + 52, gw = lw - 56, gh = lh - 92;
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(gx, gy, gw, gh);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      lnData.forEach(([sym, rad], idx) => {
        const x = gx + (idx / (lnData.length - 1)) * gw;
        const y = gy + gh - ((rad - 82) / 25) * gh;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      lnData.forEach(([sym, rad], idx) => {
        const x = gx + (idx / (lnData.length - 1)) * gw;
        const y = gy + gh - ((rad - 82) / 25) * gh;
        const highlight = (state.key === "ceo2" && sym === "Ce") || (state.key === "er" && sym === "Er") || (state.key === "la2o3" && sym === "La");
        ctx.beginPath();
        ctx.arc(x, y, highlight ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = highlight ? "#fbbf24" : "#2dd4bf";
        ctx.fill();
        ctx.fillStyle = highlight ? "#fbbf24" : "#94a3b8";
        ctx.font = highlight ? "bold 11px sans-serif" : "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sym, x, gy + gh + 16);
      });

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("La³⁺(103pm) → Lu³⁺(86pm)：核电荷增加而新电子填入内层4f轨道所致", lx + lw / 2, ly + lh - 10);

      // 右侧：芯片截面结构示意 + 材料机理卡片
      const rx = w * 0.5 + 10, ry = 42, rw = w * 0.5 - 36, rh = h - 86;
      ctx.fillStyle = "rgba(15,23,42,0.88)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = it.color;
      ctx.stroke();

      ctx.fillStyle = it.color;
      ctx.font = "bold 14.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(it.name, rx + 18, ry + 30);

      // 绘制栅叠层/接触孔层状截面图
      const stX = rx + 26, stY = ry + 52, stW = rw - 52;
      const layers = state.key === "tin"
        ? [
            { name: "W 钨接触塞 / Cu 铜互连", c: "#64748b", h: 32 },
            { name: "TiN 扩散阻挡层 (阻挡F/Cu扩散)", c: "#eab308", h: 24 },
            { name: "Ti 黏附/欧姆接触层 (生成TiSi₂)", c: "#38bdf8", h: 20 },
            { name: "Si 单晶硅源漏有源区", c: "#1e3a5f", h: 34 }
          ]
        : [
            { name: "金属栅极 / 光波导包层", c: "#475569", h: 28 },
            { name: `核心功能层：${it.formula}`, c: it.color, h: 36 },
            { name: "超薄 SiO₂ 界面层 (0.8 nm)", c: "#38bdf8", h: 16 },
            { name: "Si 单晶硅沟道衬底", c: "#1e3a5f", h: 32 }
          ];

      let curY = stY;
      layers.forEach((lyItem) => {
        ctx.fillStyle = lyItem.c;
        ctx.fillRect(stX, curY, stW, lyItem.h);
        ctx.fillStyle = "#0f172a";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(lyItem.name, stX + stW / 2, curY + lyItem.h / 2 + 4);
        curY += lyItem.h + 3;
      });

      // 文字说明
      ctx.textAlign = "left";
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      const lineChars = Math.max(22, Math.floor((rw - 44) / 12.5));
      for (let i = 0; i < Math.ceil(it.desc.length / lineChars); i++) {
        ctx.fillText(it.desc.slice(i * lineChars, (i + 1) * lineChars), rx + 20, curY + 24 + i * 20);
      }
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { key: "tin" };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     3.3 合金的结构类型与新型功能合金仿真 (ch3-alloys)
     ========================================================================== */
  ICChem.registerSim("ch3-alloys", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { type: "sub", solutePct: 15, tempC: 80 };
    const { resize } = ICChem.ui.createCanvas(viewport, 395);
    let animId = null;
    let tick = 0;

    const types = {
      sub: {
        name: "置换固溶体 (Substitutional，如芯片 Al-Cu 互连 / Au-Ag)",
        rule: "溶质与溶剂原子半径相近 (Δr < 15%)，直接取代晶格结点位置",
        example: "Al-0.5%Cu 抗电迁移互连线、Cu-Ni 康铜合金",
        hardnessGain: 1.65
      },
      inter: {
        name: "间隙固溶体 (Interstitial，如钢中 Fe-C / Ti-N)",
        rule: "小半径非金属原子 (H, B, C, N) 嵌入主金属晶格八面体/四面体空隙",
        example: "奥氏体不锈钢、渗氮硬化钛表面层",
        hardnessGain: 2.35
      },
      imc: {
        name: "金属间化合物 (IMC，如焊点界面 Cu₆Sn₅ / NiTi 记忆合金)",
        rule: "固定整数原子计量比 AmBn，长程有序超晶格，硬而脆或具形状记忆效应",
        example: "NiTi 形状记忆合金、Nb₃Sn 超导合金、BGA焊球界面 Cu₆Sn₅",
        hardnessGain: 3.10
      }
    };

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换合金相结构类型",
          activeValue: state.type,
          fullSpan: true,
          options: [
            { label: "置换固溶体 (Al-Cu)", value: "sub" },
            { label: "间隙固溶体 (Fe-C)", value: "inter" },
            { label: "金属间化合物 / NiTi 记忆合金", value: "imc" }
          ],
          onChange: (v) => { state.type = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "溶质原子含量比例", min: 5, max: 35, step: 5, value: state.solutePct, unit: " at%",
          onInput: (v) => { state.solutePct = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "工作温度 t（观察晶格热振动与 NiTi 奥氏体恢复）", min: 20, max: 250, step: 10, value: state.tempC, unit: " °C",
          onInput: (v) => { state.tempC = v; }
        }).el
      );
    }

    function render() {
      tick += 0.05;
      const tp = types[state.type];
      const distortion = (state.solutePct / 15) * tp.hardnessGain;

      headerMetricsEl.textContent = `${tp.name}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "合金结构类型", value: state.type === "sub" ? "置换固溶体" : state.type === "inter" ? "间隙固溶体" : "金属间化合物", unit: "" },
        { label: "固溶强化硬度倍率", value: (1 + distortion * 0.45).toFixed(2), unit: "× 纯金属", tone: "positive" },
        { label: "电阻率变化趋势", value: `+${(distortion * 18).toFixed(0)}%`, unit: "散射增强", tone: "warning" },
        { label: "NiTi 相态参考 (Af≈65°C)", value: state.tempC >= 65 ? "高温奥氏体(恢复原状)" : "低温马氏体(可塑形变)", tone: state.tempC >= 65 ? "positive" : "" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：二维原子晶格排布与畸变应力场
      const lx = 48, ly = 42, lw = w * 0.52 - 60, lh = h - 84;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("合金微观原子晶格排布与晶格畸变仿真", lx + lw / 2, ly + 24);

      const cols = 6, rows = 5;
      const spacingX = (lw - 80) / (cols - 1);
      const spacingY = (lh - 95) / (rows - 1);
      const vib = (state.tempC / 120) * 1.6;
      // 若为 IMC 且低温马氏体，展示切变倾角；升温 >=65°C 恢复正交奥氏体（形状记忆效应！）
      const shear = state.type === "imc" && state.tempC < 65 ? 0.22 : 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const jx = Math.sin(tick + idx * 1.3) * vib + r * spacingY * shear;
          const jy = Math.cos(tick * 1.1 + idx * 1.9) * vib;
          const ax = lx + 40 + c * spacingX + jx;
          const ay = ly + 56 + r * spacingY + jy;

          let isSoluteSub = false;
          if (state.type === "sub") {
            isSoluteSub = ((idx * 17 + 3) % 100) < state.solutePct;
          } else if (state.type === "imc") {
            isSoluteSub = (r + c) % 2 === 1;
          }

          ctx.beginPath();
          ctx.arc(ax, ay, isSoluteSub ? 15.5 : 13, 0, Math.PI * 2);
          ctx.fillStyle = isSoluteSub ? "#fb923c" : "#38bdf8";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.28)";
          ctx.stroke();

          // 间隙固溶体：在晶格空隙插入小原子 C / N
          if (state.type === "inter" && c < cols - 1 && r < rows - 1) {
            if (((idx * 29 + 7) % 100) < state.solutePct * 1.4) {
              ctx.beginPath();
              ctx.arc(ax + spacingX / 2, ay + spacingY / 2, 6, 0, Math.PI * 2);
              ctx.fillStyle = "#fbbf24";
              ctx.fill();
            }
          }
        }
      }

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(tp.rule, lx + lw / 2, ly + lh - 12);

      // 右侧：二元共晶焊料熔点降低相图示意 (Sn-Ag-Cu 无铅焊料共晶效应)
      const rx = w * 0.54, ry = 42, rw = w - rx - 30, rh = h - 84;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("合金共晶低熔点效应 (芯片封装焊料相图原理)", rx + rw / 2, ry + 24);

      const px = rx + 36, py = ry + 50, pw = rw - 64, ph = 155;
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(px, py, pw, ph);

      // 液相线 V 字共晶曲线
      const eutX = px + pw * 0.62, eutY = py + ph * 0.68;
      ctx.strokeStyle = "#2dd4bf";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(px, py + 28); // 纯组分 A 熔点
      ctx.lineTo(eutX, eutY);  // 共晶最低熔点 E
      ctx.lineTo(px + pw, py + 18); // 纯组分 B 熔点
      ctx.stroke();

      // 共晶水平线
      ctx.strokeStyle = "#fbbf24";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(px, eutY);
      ctx.lineTo(px + pw, eutY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(eutX, eutY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("共晶点 E (熔点低于任一纯金属！)", eutX - 10, eutY - 10);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("液相区 L", px + pw * 0.48, py + 44);
      ctx.fillText("固相共晶机械混合物 (α + β)", px + pw * 0.5, eutY + 32);

      // 底部新型功能合金说明
      ctx.textAlign = "left";
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("微电子典型应用实例：", rx + 24, py + ph + 34);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11.5px sans-serif";
      ctx.fillText(`• ${tp.example}`, rx + 24, py + ph + 56);
      ctx.fillText("• 试切换至【金属间化合物】并拖动温度跨越 65°C 观察 NiTi 记忆恢复！", rx + 24, py + ph + 78);

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { type: "sub", solutePct: 15, tempC: 80 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     4.1 非金属单质性质与硅基湿法/干法刻蚀化学对比 (ch4-nonmetals)
     ========================================================================== */
  ICChem.registerSim("ch4-nonmetals", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    const etchants = {
      hf: {
        name: "稀 HF / BOE 湿法刻蚀",
        target: "仅刻蚀 SiO₂（各向同性），对单晶 Si 刻蚀速率 ≈ 0",
        eq: "SiO₂ + 6HF → H₂[SiF₆](aq) + 2H₂O",
        selectivity: "SiO₂ : Si > 100 : 1",
        profile: "iso_oxide"
      },
      koh: {
        name: "80°C 热 KOH 强碱湿法腐蚀",
        target: "沿单晶硅晶向各向异性腐蚀：(100)面快，(111)面极慢 → 54.74° V型槽",
        eq: "Si + 2OH⁻ + H₂O → SiO₃²⁻ + 2H₂↑",
        selectivity: "Si(100) : SiO₂ > 200 : 1",
        profile: "aniso_koh"
      },
      hna: {
        name: "HNA 混酸 (HF + HNO₃) 腐蚀",
        target: "HNO₃ 先氧化 Si→SiO₂，HF 随即溶解 SiO₂，各向同性快速圆弧刻蚀硅",
        eq: "3Si + 4HNO₃ + 18HF → 3H₂[SiF₆] + 4NO↑ + 8H₂O",
        selectivity: "各向同性高速抛光硅",
        profile: "iso_si"
      },
      rie: {
        name: "SF₆ / CF₄ 含氟等离子体干法刻蚀 (RIE)",
        target: "高活性 F· 自由基 + 垂直离子轰击生成气态 SiF₄↑，实现垂直深宽比沟槽",
        eq: "Si(s) + 4F·(plasma) → SiF₄(g)↑",
        selectivity: "高垂直度各向异性图形转移",
        profile: "rie_vertical"
      }
    };

    let state = { key: "koh", progress: 0.72 };
    const { resize } = ICChem.ui.createCanvas(viewport, 395);

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "选择非金属化学刻蚀体系（对比酸/碱/卤素自由基反应选择性）",
          activeValue: state.key,
          fullSpan: true,
          options: [
            { label: "热 KOH 碱液 (54.74°各向异性刻硅)", value: "koh" },
            { label: "稀 HF 酸液 (选择性刻 SiO₂)", value: "hf" },
            { label: "HF+HNO₃ 混酸 (各向同性刻硅)", value: "hna" },
            { label: "SF₆ 含氟等离子体 (垂直干法RIE)", value: "rie" }
          ],
          onChange: (k) => { state.key = k; draw(); }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "刻蚀反应时间进度", min: 0.0, max: 1.0, step: 0.02, value: state.progress, unit: "", fullSpan: true,
          onInput: (v) => { state.progress = v; draw(); }
        }).el
      );
    }

    function draw() {
      const et = etchants[state.key];
      headerMetricsEl.textContent = `${et.name} | 反应方程：${et.eq}`;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "化学刻蚀体系", value: et.name.split(" ")[0] + " " + (et.name.split(" ")[1] || ""), unit: "" },
        { label: "刻蚀选择比特性", value: et.selectivity, unit: "", tone: "positive" },
        { label: "剖面几何特征", value: state.key === "koh" ? "54.74° 晶面自停止" : state.key === "rie" ? "90° 垂直深槽" : "圆弧横向钻蚀", unit: "" },
        { label: "刻蚀完成度", value: Math.round(state.progress * 100), unit: "%" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const topY = 86;
      const waferW = Math.min(580, w - 90);
      const wx = cx - waferW / 2;
      const openW = 140; // 掩模开口宽度
      const p = state.progress;

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`晶圆微纳刻蚀截面实时形貌：${et.target}`, cx, 38);

      // 硅衬底基础块
      const siTop = topY + 42;
      const siH = 205;
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(wx, siTop, waferW, siH);

      // SiO2 硬掩模层 / 光刻胶掩模层
      const oxTop = topY + 12;
      const oxH = 30;

      if (et.profile === "iso_oxide") {
        // HF 只刻蚀中间暴露的 SiO2 并产生少许横向钻蚀，碰到下方单晶 Si 完全停止！
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(wx, oxTop, waferW, oxH);
        // 挖除开口处 SiO2
        const etchDepth = oxH * p;
        const undercut = 26 * p;
        ctx.fillStyle = "#081120";
        ctx.fillRect(cx - openW / 2 - undercut, oxTop, openW + undercut * 2, etchDepth);
        // 上方光刻胶掩模
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(wx, oxTop - 18, (waferW - openW) / 2, 18);
        ctx.fillRect(cx + openW / 2, oxTop - 18, (waferW - openW) / 2, 18);
      } else {
        // 左右两侧 SiO2/Si3N4 掩模保留，中间开口刻蚀单晶硅
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(wx, oxTop, (waferW - openW) / 2, oxH);
        ctx.fillRect(cx + openW / 2, oxTop, (waferW - openW) / 2, oxH);

        ctx.fillStyle = "#081120";
        if (et.profile === "aniso_koh") {
          // 54.74° 梯形/V型槽 (tan 54.74° = √2 ≈ 1.414)
          const maxVDepth = (openW / 2) * 1.414;
          const d = maxVDepth * p;
          const bottomHalf = Math.max(0, openW / 2 - d / 1.414);
          ctx.beginPath();
          ctx.moveTo(cx - openW / 2, siTop - 1);
          ctx.lineTo(cx + openW / 2, siTop - 1);
          ctx.lineTo(cx + bottomHalf, siTop + d);
          ctx.lineTo(cx - bottomHalf, siTop + d);
          ctx.closePath();
          ctx.fill();

          // 标注 54.74° (111) 慢速晶面
          if (p > 0.25) {
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("(111) 密排晶面 54.74° 自停止", cx, siTop + d + 22);
          }
        } else if (et.profile === "iso_si") {
          // HNA 各向同性圆弧下蚀 + 掩模下横向钻蚀
          const r = 95 * p;
          ctx.beginPath();
          ctx.ellipse(cx, siTop, openW / 2 + r * 0.75, r, 0, 0, Math.PI);
          ctx.fill();
        } else if (et.profile === "rie_vertical") {
          // RIE 垂直深沟槽 + 定向离子箭头
          const d = 155 * p;
          ctx.fillRect(cx - openW / 2, siTop - 1, openW, d);
          ctx.strokeStyle = "#a78bfa";
          ctx.lineWidth = 1.8;
          for (let k = -2; k <= 2; k++) {
            const ix = cx + k * 24;
            ctx.beginPath();
            ctx.moveTo(ix, oxTop - 15);
            ctx.lineTo(ix, siTop + d - 8);
            ctx.stroke();
          }
        }
      }

      // 图例标注
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("■ 深蓝：单晶 Si (100) 衬底    ■ 亮青：SiO₂ 绝缘层    ■ 玫红：光刻胶掩模", wx, h - 22);
    }

    buildControls();
    draw();

    return {
      reset() {
        state = { key: "koh", progress: 0.72 };
        buildControls();
        draw();
      },
      redraw: draw,
      destroy() {}
    };
  });

  /* ==========================================================================
     4.2 金属能带理论、本征半导体与 N/P 型掺杂导电机理 (ch4-band)
     ========================================================================== */
  ICChem.registerSim("ch4-band", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { mode: "ntype", tempK: 300, logDoping: 16 };
    const { resize } = ICChem.ui.createCanvas(viewport, 410);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换固体材料与半导体掺杂类型",
          activeValue: state.mode,
          fullSpan: true,
          options: [
            { label: "N型硅 (掺V族磷 P, 施主电子)", value: "ntype" },
            { label: "P型硅 (掺III族硼 B, 受主空穴)", value: "ptype" },
            { label: "本征高纯硅 Si (Eg=1.12eV)", value: "intrinsic" },
            { label: "金属导体 Cu (能带重叠)", value: "metal" },
            { label: "绝缘体 SiO₂ (Eg≈9.0eV)", value: "insulator" }
          ],
          onChange: (m) => { state.mode = m; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "工作温度 T (影响热激发本征载流子 ni)", min: 150, max: 600, step: 25, value: state.tempK, unit: " K",
          onInput: (v) => { state.tempK = v; }
        }).el
      );
      controlsEl.appendChild(
        ICChem.ui.slider({
          label: "杂质掺杂浓度指数 lg N (10^x cm⁻³)", min: 14, max: 18, step: 0.5, value: state.logDoping, unit: "",
          onInput: (v) => { state.logDoping = v; }
        }).el
      );
    }

    function render() {
      tick += 0.045;
      // 计算硅本征载流子浓度 ni(T): 300K 时 ni ≈ 1.0e10 cm^-3
      const Eg = 1.12; // eV
      const kB_eV = 8.617e-5;
      const ni = 3.9e16 * Math.pow(state.tempK, 1.5) * Math.exp(-Eg / (2 * kB_eV * state.tempK));
      const Ndop = Math.pow(10, state.logDoping);

      let nConc = ni, pConc = ni, efShift = 0, bandDesc = "";
      if (state.mode === "ntype") {
        nConc = 0.5 * (Ndop + Math.sqrt(Ndop * Ndop + 4 * ni * ni));
        pConc = (ni * ni) / nConc;
        efShift = Math.min(0.48, kB_eV * state.tempK * Math.log(nConc / ni));
        bandDesc = "五价 P 施主能级 ED 紧邻导带底，多数载流子为电子 (n ≫ p)";
      } else if (state.mode === "ptype") {
        pConc = 0.5 * (Ndop + Math.sqrt(Ndop * Ndop + 4 * ni * ni));
        nConc = (ni * ni) / pConc;
        efShift = -Math.min(0.48, kB_eV * state.tempK * Math.log(pConc / ni));
        bandDesc = "三价 B 受主能级 EA 紧邻价带顶，多数载流子为空穴 (p ≫ n)";
      } else if (state.mode === "intrinsic") {
        bandDesc = "本征激发电子与空穴严格成对产生 (n = p = ni)，费米能级居中";
      } else if (state.mode === "metal") {
        nConc = 8.5e22;
        pConc = 0;
        bandDesc = "金属导带与价带重叠 (Eg = 0)，海量自由电子无需热激发即可导电";
      } else {
        nConc = 0;
        pConc = 0;
        bandDesc = "绝缘体 SiO₂ 禁带高达 ~9.0 eV，室温热运动无法将价电子激发至导带";
      }

      headerMetricsEl.textContent = bandDesc;
      ICChem.ui.renderReadouts(readoutEl, [
        { label: "禁带宽度 Eg", value: state.mode === "metal" ? "0 (重叠)" : state.mode === "insulator" ? "9.0" : "1.12", unit: "eV" },
        { label: "自由电子浓度 n", value: nConc > 0 ? nConc.toExponential(1) : "~0", unit: "cm⁻³", tone: state.mode === "ntype" ? "positive" : "" },
        { label: "空穴浓度 p", value: pConc > 0 ? pConc.toExponential(1) : "~0", unit: "cm⁻³", tone: state.mode === "ptype" ? "warning" : "" },
        { label: "费米能级偏移 EF − Ei", value: state.mode === "metal" || state.mode === "insulator" ? "—" : (efShift >= 0 ? "+" : "") + efShift.toFixed(2), unit: "eV" }
      ]);

      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      // 左侧：共价键二维硅晶格与电子/空穴微观迁移图
      const lx = 44, ly = 36, lw = w * 0.47 - 54, lh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, lx, ly, lw, lh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("共价键晶格与载流子微观图像", lx + lw / 2, ly + 24);

      const gCols = 3, gRows = 3;
      const sx = (lw - 90) / (gCols - 1), sy = (lh - 105) / (gRows - 1);
      for (let r = 0; r < gRows; r++) {
        for (let c = 0; c < gCols; c++) {
          const ax = lx + 45 + c * sx;
          const ay = ly + 64 + r * sy;
          // 共价双线键
          if (c < gCols - 1) {
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.strokeRect(ax + 16, ay - 3, sx - 32, 6);
          }
          if (r < gRows - 1) {
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.strokeRect(ax - 3, ay + 16, 6, sy - 32);
          }

          const isCenter = r === 1 && c === 1;
          let atomLabel = "Si⁴⁺", atomColor = "#1e3a5f";
          if (state.mode === "ntype" && isCenter) { atomLabel = "P⁵⁺"; atomColor = "#0284c7"; }
          else if (state.mode === "ptype" && isCenter) { atomLabel = "B³⁻"; atomColor = "#d97706"; }
          else if (state.mode === "metal") { atomLabel = "Cu⁺"; atomColor = "#ea580c"; }
          else if (state.mode === "insulator") { atomLabel = isCenter ? "O" : "Si"; atomColor = "#475569"; }

          ctx.beginPath();
          ctx.arc(ax, ay, 16, 0, Math.PI * 2);
          ctx.fillStyle = atomColor;
          ctx.fill();
          ctx.strokeStyle = "#94a3b8";
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(atomLabel, ax, ay + 4);
        }
      }

      // 绘制游离电子 (亮青实心球) 或 空穴 (金色空心圈)
      if (state.mode === "ntype" || state.mode === "metal" || state.mode === "intrinsic") {
        const numE = state.mode === "metal" ? 16 : state.mode === "ntype" ? 6 : 2;
        for (let i = 0; i < numE; i++) {
          const ex = lx + 35 + ((Math.sin(tick * 1.4 + i * 2.1) * 0.5 + 0.5) * (lw - 70));
          const ey = ly + 55 + ((Math.cos(tick * 1.2 + i * 1.7) * 0.5 + 0.5) * (lh - 90));
          ctx.beginPath();
          ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = "#38bdf8";
          ctx.fill();
        }
      }
      if (state.mode === "ptype" || state.mode === "intrinsic") {
        const numH = state.mode === "ptype" ? 6 : 2;
        for (let i = 0; i < numH; i++) {
          const hx = lx + 35 + ((Math.cos(tick * 1.1 + i * 2.4) * 0.5 + 0.5) * (lw - 70));
          const hy = ly + 55 + ((Math.sin(tick * 1.3 + i * 1.5) * 0.5 + 0.5) * (lh - 90));
          ctx.beginPath();
          ctx.arc(hx, hy, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // 右侧：固体能带结构图 (Ec, Ev, Eg, EF, ED/EA)
      const rx = w * 0.5 + 10, ry = 36, rw = w * 0.5 - 36, rh = h - 72;
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.3)";
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("固体电子能带结构图 (Energy Band Diagram)", rx + rw / 2, ry + 24);

      const bx = rx + 42, bw = rw - 84;
      const gapSize = state.mode === "metal" ? -18 : state.mode === "insulator" ? 155 : 88;
      const midY = ry + rh / 2 + 8;

      const ecBottom = midY - gapSize / 2;
      const evTop = midY + gapSize / 2;

      // 导带 Conduction Band
      ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
      ctx.fillRect(bx, ry + 48, bw, Math.max(36, ecBottom - (ry + 48)));
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(bx, ry + 48, bw, Math.max(36, ecBottom - (ry + 48)));
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("导带 (Conduction Band, Ec)", bx + bw / 2, ry + 70);

      // 价带 Valence Band
      ctx.fillStyle = "rgba(129, 140, 248, 0.28)";
      ctx.fillRect(bx, evTop, bw, ry + rh - 24 - evTop);
      ctx.strokeStyle = "#818cf8";
      ctx.strokeRect(bx, evTop, bw, ry + rh - 24 - evTop);
      ctx.fillStyle = "#a5b4fc";
      ctx.fillText("价带 (Valence Band, Ev)", bx + bw / 2, ry + rh - 38);

      // 半导体费米能级 EF 与施主/受主杂质能级
      if (state.mode !== "metal" && state.mode !== "insulator") {
        const efY = midY - (efShift / 0.56) * (gapSize / 2 - 8);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(bx - 12, efY);
        ctx.lineTo(bx + bw + 12, efY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 11.5px sans-serif";
        ctx.fillText(`费米能级 EF`, bx + bw - 42, efY - 6);

        if (state.mode === "ntype") {
          ctx.strokeStyle = "#fbbf24";
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(bx + 10, ecBottom + 11);
          ctx.lineTo(bx + bw - 10, ecBottom + 11);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#fbbf24";
          ctx.fillText("施主能级 ED (P)", bx + 54, ecBottom + 24);
        } else if (state.mode === "ptype") {
          ctx.strokeStyle = "#fbbf24";
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(bx + 10, evTop - 11);
          ctx.lineTo(bx + bw - 10, evTop - 11);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#fbbf24";
          ctx.fillText("受主能级 EA (B)", bx + 54, evTop - 16);
        }
      } else if (state.mode === "insulator") {
        ctx.fillStyle = "#fb7185";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("宽禁带 Eg ≈ 9.0 eV (电子无法跨越)", bx + bw / 2, midY + 5);
      }

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { mode: "ntype", tempK: 300, logDoping: 16 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });

  /* ==========================================================================
     4.3 激光材料、光纤全反射通信与超导材料特性 (ch4-laser-fiber)
     ========================================================================== */
  ICChem.registerSim("ch4-laser-fiber", function ({ viewport, readoutEl, controlsEl, headerMetricsEl }) {
    let state = { tab: "laser", pumpPct: 78, fiberAngleDeg: 14, scTempK: 4.2 };
    const { resize } = ICChem.ui.createCanvas(viewport, 400);
    let animId = null;
    let tick = 0;

    function buildControls() {
      controlsEl.innerHTML = "";
      controlsEl.appendChild(
        ICChem.ui.buttonGroup({
          label: "切换三大新型无机非金属功能材料实验模块",
          activeValue: state.tab,
          fullSpan: true,
          options: [
            { label: "⚡ 激光材料与受激辐射谐振腔 (ArF/Nd:YAG)", value: "laser" },
            { label: "🌐 光导纤维全反射与数值孔径 NA", value: "fiber" },
            { label: "❄️ 超导材料临界温度 Tc 与迈斯纳磁悬浮", value: "super" }
          ],
          onChange: (t) => { state.tab = t; buildControls(); }
        }).el
      );

      if (state.tab === "laser") {
        controlsEl.appendChild(
          ICChem.ui.slider({
            label: "泵浦源激励功率 P_pump（阈值 50% 实现粒子数反转 N₂ > N₁）", min: 10, max: 100, step: 2, value: state.pumpPct, unit: " %", fullSpan: true,
            onInput: (v) => { state.pumpPct = v; }
          }).el
        );
      } else if (state.tab === "fiber") {
        controlsEl.appendChild(
          ICChem.ui.slider({
            label: "光纤端面外部入射角 θ₀（n₁=1.48 掺锗石英纤芯，n₂=1.45 包层）", min: 2, max: 35, step: 1, value: state.fiberAngleDeg, unit: " °", fullSpan: true,
            onInput: (v) => { state.fiberAngleDeg = v; }
          }).el
        );
      } else {
        controlsEl.appendChild(
          ICChem.ui.slider({
            label: "超导约瑟夫森芯片/YBCO 环境温度 T（对比临界温度 Tc = 92 K）", min: 4, max: 160, step: 2, value: state.scTempK, unit: " K", fullSpan: true,
            onInput: (v) => { state.scTempK = v; }
          }).el
        );
      }
    }

    function render() {
      tick += 0.06;
      const { ctx, w, h } = resize();
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, w, h);

      if (state.tab === "laser") {
        const lasing = state.pumpPct >= 50;
        const outPower = lasing ? ((state.pumpPct - 50) * 1.8).toFixed(1) : "0.0 (仅微弱自发辐射)";
        headerMetricsEl.textContent = "激光器三要素：工作物质（如 ArF 193nm / Nd:YAG 1064nm）+ 泵浦源 + 光学谐振腔";
        ICChem.ui.renderReadouts(readoutEl, [
          { label: "能级粒子数分布", value: lasing ? "N₂ > N₁ (粒子数反转 ✓)" : "N₂ < N₁ (热平衡未反转)", tone: lasing ? "positive" : "warning" },
          { label: "辐射机制", value: lasing ? "受激辐射相干放大" : "自发非相干荧光", unit: "" },
          { label: "相干激光输出功率", value: outPower, unit: lasing ? "W" : "", tone: lasing ? "positive" : "" },
          { label: "光刻/加工典型波长", value: "193 / 248 / 1064", unit: "nm" }
        ]);

        // 绘制光学谐振腔（左全反镜 100%，右半透输出镜 95%）
        const cx = w * 0.42, cy = h * 0.52, rodW = Math.min(340, w * 0.48), rodH = 84;
        // 全反镜
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(cx - rodW / 2 - 18, cy - 58, 12, 116);
        // 输出耦合半透镜
        ctx.fillStyle = "rgba(148,163,184,0.6)";
        ctx.fillRect(cx + rodW / 2 + 6, cy - 58, 10, 116);

        // 激光增益晶体棒/气体腔
        ctx.fillStyle = lasing ? "rgba(168, 85, 247, 0.38)" : "rgba(168, 85, 247, 0.16)";
        ctx.fillRect(cx - rodW / 2, cy - rodH / 2, rodW, rodH);
        ctx.strokeStyle = "#c084fc";
        ctx.strokeRect(cx - rodW / 2, cy - rodH / 2, rodW, rodH);

        if (lasing) {
          // 腔内相干往返光子束与右侧高准直激光束输出！
          const beamAlpha = Math.min(0.95, 0.35 + (state.pumpPct - 50) / 80);
          ctx.fillStyle = `rgba(56, 189, 248, ${beamAlpha})`;
          ctx.fillRect(cx - rodW / 2 - 6, cy - 12, rodW + 12, 24);
          ctx.fillRect(cx + rodW / 2 + 16, cy - 9, w - (cx + rodW / 2 + 30), 18);

          // 相干波前条纹
          ctx.strokeStyle = "#fff";
          for (let x = cx + rodW / 2 + 24; x < w - 30; x += 22) {
            const sx = x + ((tick * 12) % 22);
            ctx.beginPath();
            ctx.moveTo(sx, cy - 9);
            ctx.lineTo(sx, cy + 9);
            ctx.stroke();
          }
        } else {
          // 杂乱自发辐射短箭头
          ctx.strokeStyle = "#94a3b8";
          for (let i = 0; i < 10; i++) {
            const px = cx - rodW / 3 + i * (rodW / 14);
            const ang = i * 1.1 + tick;
            ctx.beginPath();
            ctx.moveTo(px, cy);
            ctx.lineTo(px + Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("100% 全反射镜", cx - rodW / 2 - 12, cy - 68);
        ctx.fillText("激光工作物质（泵浦实现粒子数反转）", cx, cy - 56);
        ctx.fillText("部分透射输出镜", cx + rodW / 2 + 12, cy - 68);

      } else if (state.tab === "fiber") {
        const n1 = 1.48, n2 = 1.45;
        const NA = Math.sqrt(n1 * n1 - n2 * n2); // ~0.296
        const maxAcceptDeg = (Math.asin(NA) * 180) / Math.PI; // ~17.25°
        const isTIR = state.fiberAngleDeg <= maxAcceptDeg;

        headerMetricsEl.textContent = `高纯 SiO₂ 光导纤维：纤芯折射率 n₁=${n1} > 包层 n₂=${n2} | 最大孔径角 θ_max = ${maxAcceptDeg.toFixed(1)}°`;
        ICChem.ui.renderReadouts(readoutEl, [
          { label: "光纤数值孔径 NA", value: NA.toFixed(3), unit: "" },
          { label: "全反射最大接收角 θmax", value: maxAcceptDeg.toFixed(1), unit: "°" },
          { label: "当前入射角 θ₀", value: state.fiberAngleDeg, unit: "°", tone: isTIR ? "positive" : "danger" },
          { label: "光信号传输状态", value: isTIR ? "全内反射无损导光 ✓" : "突破临界角漏光衰减 ✕", tone: isTIR ? "positive" : "danger" }
        ]);

        const fx = 95, fy = h / 2, fw = w - 140, coreH = 88, cladH = 166;
        // 包层 Cladding
        ctx.fillStyle = "rgba(30, 58, 95, 0.65)";
        ctx.fillRect(fx, fy - cladH / 2, fw, cladH);
        // 纤芯 Core
        ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
        ctx.fillRect(fx, fy - coreH / 2, fw, coreH);
        ctx.strokeStyle = "#38bdf8";
        ctx.strokeRect(fx, fy - coreH / 2, fw, coreH);

        // 计算折射进纤芯后的角度 sin(θ_in) = sin(θ0)/n1
        const rad0 = (state.fiberAngleDeg * Math.PI) / 180;
        const thetaIn = Math.asin(Math.sin(rad0) / n1);
        const slope = Math.tan(thetaIn);

        // 外部入射光线
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(24, fy + 71 * Math.tan(rad0));
        ctx.lineTo(fx, fy);
        ctx.stroke();

        // 纤芯内折线反射路径
        let curX = fx, curY = fy, dirY = -1;
        ctx.strokeStyle = isTIR ? "#34d399" : "#fb7185";
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        while (curX < fx + fw) {
          const targetY = dirY < 0 ? fy - coreH / 2 : fy + coreH / 2;
          const dx = Math.abs(targetY - curY) / Math.max(0.03, slope);
          if (curX + dx >= fx + fw) {
            ctx.lineTo(fx + fw, curY + dirY * (fx + fw - curX) * slope);
            break;
          }
          curX += dx;
          curY = targetY;
          ctx.lineTo(curX, curY);
          // 如果未满足全反射，画出向包层折射漏出的能量线
          if (!isTIR) {
            ctx.save();
            ctx.strokeStyle = "rgba(251, 113, 133, 0.45)";
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(curX + 55, curY + dirY * 38);
            ctx.stroke();
            ctx.restore();
          }
          dirY *= -1;
        }
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("包层 Cladding (低折射率 n₂ = 1.45, 掺F石英)", fx + 14, fy - cladH / 2 + 20);
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("纤芯 Core (高折射率 n₁ = 1.48, GeO₂-SiO₂)", fx + 14, fy - coreH / 2 + 20);

      } else {
        const Tc = 92; // YBCO 高温超导氧化物 Tc = 92 K
        const isSuper = state.scTempK < Tc;
        const resVal = isSuper ? 0 : (0.18 + (state.scTempK - Tc) * 0.0045);

        headerMetricsEl.textContent = `氧化物超导材料 YBa₂Cu₃O₇₋δ (Tc = 92 K > 液氮沸点 77 K) | 零电阻与完全抗磁性`;
        ICChem.ui.renderReadouts(readoutEl, [
          { label: "超导临界温度 Tc", value: Tc, unit: "K" },
          { label: "当前样品温度 T", value: state.scTempK, unit: "K", tone: isSuper ? "positive" : "warning" },
          { label: "直流电阻率 ρ(T)", value: isSuper ? "0.000 (严格零电阻!)" : resVal.toFixed(3), unit: isSuper ? "" : "mΩ·cm", tone: isSuper ? "positive" : "" },
          { label: "体内磁感应强度 B", value: isSuper ? "B = 0 (迈斯纳磁悬浮)" : "B > 0 (磁力线穿透)", tone: isSuper ? "positive" : "" }
        ]);

        // 左侧：R-T 超导相变陡降曲线
        const gx = 56, gy = 48, gw = w * 0.48 - 70, gh = h - 98;
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = "#475569";
        ctx.strokeRect(gx, gy, gw, gh);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12.5px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("超导电阻-温度转变曲线 R(T)", gx + 12, gy - 10);

        const mapX = (T) => gx + ((T - 4) / 156) * gw;
        const baseY = gy + gh - 24;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mapX(4), baseY);
        ctx.lineTo(mapX(Tc - 1), baseY);
        ctx.lineTo(mapX(Tc + 1), baseY - 120);
        ctx.lineTo(mapX(160), baseY - 210);
        ctx.stroke();

        // 当前温度圆点
        const curY = isSuper ? baseY : baseY - 120 - ((state.scTempK - Tc) / 68) * 90;
        ctx.fillStyle = isSuper ? "#34d399" : "#fbbf24";
        ctx.beginPath();
        ctx.arc(mapX(state.scTempK), curY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`Tc = 92K`, mapX(Tc) - 20, baseY + 18);

        // 右侧：迈斯纳效应永磁体悬浮动画
        const rx = w * 0.54, ry = 48, rw = w - rx - 36, rh = h - 98;
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ICChem.ui.drawRoundRect(ctx, rx, ry, rw, rh, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(56,189,248,0.3)";
        ctx.stroke();

        const cx2 = rx + rw / 2;
        const diskY = ry + rh - 65;
        // 超导圆盘
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx2 - 75, diskY, 150, 28);
        ctx.strokeStyle = isSuper ? "#38bdf8" : "#64748b";
        ctx.strokeRect(cx2 - 75, diskY, 150, 28);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "11.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("YBCO 超导圆盘", cx2, diskY + 18);

        // 永磁体（T < Tc 悬浮空中微颤；T >= Tc 落在圆盘上！）
        const magY = isSuper ? diskY - 82 + Math.sin(tick * 1.4) * 4 : diskY - 28;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(cx2 - 28, magY, 28, 28);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(cx2, magY, 28, 28);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("N", cx2 - 14, magY + 18);
        ctx.fillText("S", cx2 + 14, magY + 18);

        ctx.fillStyle = isSuper ? "#34d399" : "#fbbf24";
        ctx.font = "bold 12.5px sans-serif";
        ctx.fillText(isSuper ? "T < Tc：磁力线被完全排斥，永磁体稳定磁悬浮！" : "T > Tc：处于正常态，磁力线穿透无悬浮", cx2, ry + 32);
      }

      animId = requestAnimationFrame(render);
    }

    buildControls();
    render();

    return {
      reset() {
        state = { tab: "laser", pumpPct: 78, fiberAngleDeg: 14, scTempK: 4.2 };
        buildControls();
      },
      destroy() {
        if (animId) cancelAnimationFrame(animId);
      }
    };
  });
})();
