/* ==========================================================================
   《集成工艺化学》(JC00158) 课程教学大纲结构化数据库
   覆盖：课堂讲授 第一章 ~ 第六章 + 课内实践 五大必做实验项目 (共7大模块、26个交互仿真案例)
   ========================================================================== */

window.ICChem = window.ICChem || {
  sims: {},
  chapters: []
};

window.ICChem.courseMeta = {
  code: "JC00158",
  name: "集成工艺化学",
  enName: "Chemistry for Integrated Process Technology",
  university: "深圳技术大学 (Shenzhen Technology University)",
  unit: "集成电路与光电芯片学院",
  students: "2025级 微电子科学与工程专业",
  credits: "3学分（课堂讲授2学分 + 课内实践1学分）",
  hours: "54学时（课堂讲授36学时 + 课内实践18学时）",
  grading: [
    { item: "考勤 (Attendance)", ratio: "5%", detail: "课堂与实验室出勤" },
    { item: "个人作业 (Homework)", ratio: "5%", detail: "2次，2.5%/次" },
    { item: "随堂检测 (In-class Test)", ratio: "10%", detail: "2次，5%/次" },
    { item: "实验实践 (Experimental Practice)", ratio: "30%", detail: "5次必做实验，6%/次（单次百分制：预习20%+操作20%+数据40%+思考题15%+报告印象5%）" },
    { item: "期末考试 (Final Exam)", ratio: "50%", detail: "闭卷笔试" }
  ]
};

window.ICChem.chapters = [
  /* ==================== 第一章：化学反应基本规律 ==================== */
  {
    id: "ch1",
    shortTitle: "第一章 化学反应规律",
    fullTitle: "第一章：化学反应基本规律 (Basic Laws of Chemical Reactions)",
    weeks: "第1–3周 (18学时含实验)",
    cases: [
      {
        id: "ch1-thermo",
        title: "1.1 质量守恒、热力学第一定律与CVD反应热计算",
        shortDesc: "热力学能 ΔU、焓变 ΔH、盖斯定律与硅气相沉积热效应",
        syllabusRef: "第一章 (1) 基本概念、质量守恒定律、热力学第一定律、反应热及其计算",
        levels: ["掌握", "理解"],
        objectives: [
          { level: "掌握", text: "热力学第一定律基本内容（ΔU = Q + W）及恒压反应热 Q_p = ΔH 的关系。" },
          { level: "理解", text: "热力学能、焓、功、热、热容的定义，标准摩尔生成焓 Δ_fH°m 与盖斯定律计算。" }
        ],
        formulaHtml: `
          <div>ΔU = Q + W &nbsp;&nbsp;|&nbsp;&nbsp; H = U + pV &nbsp;&nbsp;|&nbsp;&nbsp; Q<sub>p</sub> = Δ<sub>r</sub>H<sub>m</sub><sup>⊖</sup></div>
          <div>Δ<sub>r</sub>H<sub>m</sub><sup>⊖</sup> = ∑ ν<sub>B</sub> Δ<sub>f</sub>H<sub>m</sub><sup>⊖</sup>(生成物) − ∑ ν<sub>A</sub> Δ<sub>f</sub>H<sub>m</sub><sup>⊖</sup>(反应物)</div>
        `,
        theoryPoints: [
          "质量守恒与原子守恒是一切化学计量与CVD前驱体流量配比的基础。",
          "热力学第一定律指出体系内能变化 ΔU 等于吸收的热量 Q 与环境对体系做功 W 之和。",
          "根据盖斯定律，化学反应的热效应只与始态和终态有关，而与反应途径无关。"
        ],
        icConnection: "在<strong>化学气相沉积 (CVD)</strong>与<strong>硅外延生长</strong>中，硅烷热解（SiH₄ → Si + 2H₂，吸热）与三氯氢硅氢还原（SiHCl₃ + H₂ → Si + 3HCl，强吸热）对反应腔加热功率和晶圆表面温度均匀性提出了严格的热力学控制要求。",
        guideSteps: [
          "切换不同的芯片制造典型反应体系（硅烷CVD、三氯氢硅外延、热氧化SiO₂）。",
          "调节反应摩尔数 n 与环境外压 p，观察体系吸放热 Q_p、体积功 W 与内能变 ΔU 的定量柱状图与焓变能级图。",
          "验证分步途径与一步反应总焓变恒等（盖斯定律）。"
        ],
        quizzes: [
          {
            q: "在恒温恒压且不做非体积功的CVD反应腔中，体系吸收的热量 Q_p 等于下列哪个状态函数的变化量？",
            options: ["热力学能变 ΔU", "焓变 ΔH", "熵变 ΔS", "膨胀功 W"],
            answer: 1,
            explain: "恒压且非体积功 W'=0 时，ΔU = Q_p - pΔV，故 Q_p = (U₂+pV₂)-(U₁+pV₁) = ΔH。"
          },
          {
            q: "已知标准状态下 Si(s) + O₂(g) → SiO₂(s) 的 Δ_rH°m = -910.9 kJ/mol，这说明晶圆热氧化反应属于：",
            options: ["强吸热反应，需持续外部输入化学能", "强放热反应，标准摩尔生成焓为 -910.9 kJ/mol", "等焓反应，ΔH = 0", "体积膨胀做正功反应"],
            answer: 1,
            explain: "由稳定单质 Si(s) 和 O₂(g) 生成 1 mol SiO₂(s) 的反应焓变即为其标准摩尔生成焓，负号代表强放热。"
          }
        ]
      },
      {
        id: "ch1-gibbs",
        title: "1.2 反应自发性、熵与吉布斯自由能判据 (ΔG-T)",
        shortDesc: "热力学第二定律、熵变 ΔS 与晶圆氧化/金属还原温区判据",
        syllabusRef: "第一章 (2) 化学反应的自发性、熵、吉布斯自由能",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "热力学第二定律基本内容与自发过程的特点。" },
          { level: "理解", text: "熵 S 的统计物理意义、标准摩尔熵计算及 ΔG = ΔH - TΔS 自发性判据。" },
          { level: "了解", text: "吉布斯函数及标准摩尔吉布斯函数变随温度的变化（Ellingham 图思想）。" }
        ],
        formulaHtml: `
          <div>Δ<sub>r</sub>G<sub>m</sub>(T) ≈ Δ<sub>r</sub>H<sub>m</sub><sup>⊖</sup> − T · Δ<sub>r</sub>S<sub>m</sub><sup>⊖</sup></div>
          <div>判据：ΔG &lt; 0 正向自发；&nbsp; ΔG = 0 处于平衡（T<sub>eq</sub> = ΔH / ΔS）；&nbsp; ΔG &gt; 0 非自发</div>
        `,
        theoryPoints: [
          "孤立体系自发过程总是向熵增加（混乱度增大，ΔS_孤立 > 0）的方向进行。",
          "恒温恒压下采用吉布斯自由能变 ΔG 综合考量焓驱动（ΔH）与熵驱动（TΔS）：四种 ΔH/ΔS 符号组合决定了反应是全温区自发、低温自发、高温自发还是全温区非自发。"
        ],
        icConnection: "在<strong>高k栅介质退火</strong>与<strong>金属硅化物工艺</strong>中，若金属（如 Ti、Hf）对氧的吉布斯自由能比 Si 更负，热退火时会自发夺取 SiO₂ 中的氧（界面氧化还原反应）；而在氢气氛退火中可利用 H₂ 还原铜互连表面氧化层 CuO，但无法在常规温度还原 SiO₂。",
        guideSteps: [
          "选择预设工艺反应或自由调节 ΔH 与 ΔS 滑块，观察四种热力学象限。",
          "拖动温度 T (300 K – 1800 K)，在 ΔG–T 图上实时观察转折温度 T_eq 与工作点正负号。",
          "观察右侧微观粒子混乱度（熵）与自发趋势指示器。"
        ],
        quizzes: [
          {
            q: "某CVD前驱体热分解反应为吸热（ΔH > 0）且气体分子数增加（ΔS > 0），要使该反应正向自发进行，工艺上应当：",
            options: ["降低衬底温度至 T < ΔH/ΔS", "升高衬底温度至 T > ΔH/ΔS", "无论什么温度均不可能自发", "增大惰性载气分压抑制熵增"],
            answer: 1,
            explain: "当 ΔH > 0 且 ΔS > 0 时，只有当温度 T > ΔH/ΔS，使得 -TΔS 绝对值超过 ΔH，才有 ΔG < 0 实现高温自发。"
          }
        ]
      },
      {
        id: "ch1-equil",
        title: "1.3 化学平衡常数与平衡移动动态仿真",
        shortDesc: "可逆反应 Q 与 K° 比较、勒夏特列原理（温度/压力/配比调控）",
        syllabusRef: "第一章 (3) 化学平衡、平衡常数、化学平衡的移动",
        levels: ["掌握", "了解"],
        objectives: [
          { level: "掌握", text: "化学平衡状态特征、标准平衡常数 K° 表达式及勒夏特列平衡移动规律。" },
          { level: "了解", text: "可逆反应正逆速率相等的动态平衡本质及 Δ_rG°m = -RT ln K° 关系。" }
        ],
        formulaHtml: `
          <div>Δ<sub>r</sub>G<sub>m</sub><sup>⊖</sup> = −RT ln K<sup>⊖</sup> &nbsp;&nbsp;|&nbsp;&nbsp; Δ<sub>r</sub>G<sub>m</sub> = RT ln(Q / K<sup>⊖</sup>)</div>
          <div>示例外延可逆反应：SiCl<sub>4</sub>(g) + 2H<sub>2</sub>(g) ⇌ Si(s) + 4HCl(g) &nbsp;(ΔH &gt; 0)</div>
        `,
        theoryPoints: [
          "化学平衡是动态平衡：v_正 = v_逆 > 0，各组分浓度/分压保持恒定。",
          "温度是唯一改变平衡常数 K° 的因素（吸热反应升温 K° 增大；放热反应升温 K° 减小）。",
          "改变反应物分压或体系总压会改变反应商 Q：当 Q < K° 正向移动（沉积硅），当 Q > K° 逆向移动（HCl 反刻蚀硅晶圆！）。"
        ],
        icConnection: "<strong>硅外延生长 (SiCl₄ + 2H₂ ⇌ Si + 4HCl)</strong> 是可逆化学平衡的经典工业实例：H₂ 过量时 Q < K° 实现外延沉积；若提高 HCl 比例使 Q > K°，平衡逆向移动，同一反应腔即可实现<strong>原位气相刻蚀抛光晶圆表面缺陷</strong>！",
        guideSteps: [
          "调节反应腔温度 T、总压 P 以及进气 Cl/H 摩尔比。",
          "观察 Q 与 K° 的实时比值，查看硅晶圆表面究竟处于【外延生长模式】还是【HCl气相刻蚀模式】。",
          "点击“注入脉冲 HCl”或“升温阶跃”，观察浓度时间弛豫曲线如何建立新平衡。"
        ],
        quizzes: [
          {
            q: "对于硅外延可逆反应 SiCl₄(g) + 2H₂(g) ⇌ Si(s) + 4HCl(g)（ΔH > 0，气体分子数由3变为4），下列哪项操作不利于硅的沉积？",
            options: ["适当升高外延炉晶圆温度", "增大高纯 H₂ 载气进气比例", "增大体系总压强并通入过量 HCl 气体", "及时排出尾气中的副产物 HCl"],
            answer: 2,
            explain: "正向反应气体计量数增加（3→4），增大总压并增加生成物 HCl 会使 Q > K°，平衡逆向移动导致硅被刻蚀。"
          }
        ]
      },
      {
        id: "ch1-kinetics",
        title: "1.4 化学反应速率、活化能与阿伦尼乌斯定律",
        shortDesc: "碰撞理论、过渡态活化能垒 E_a、浓度/温度/催化剂对刻蚀速率影响",
        syllabusRef: "第一章 (4) 化学反应速率、反应速率理论和活化能、影响化学反应速率的因素",
        levels: ["掌握", "了解"],
        objectives: [
          { level: "掌握", text: "化学反应速率表示法，浓度（质量作用定律）、温度（阿伦尼乌斯方程）、催化剂对速率的影响。" },
          { level: "了解", text: "有效碰撞理论、麦克斯韦-玻尔兹曼能量分布、过渡态理论和活化能 E_a。" }
        ],
        formulaHtml: `
          <div>v = k · [A]<sup>m</sup>[B]<sup>n</sup> &nbsp;&nbsp;|&nbsp;&nbsp; k = A · exp(−E<sub>a</sub> / RT)</div>
          <div>ln(k<sub>2</sub> / k<sub>1</sub>) = (E<sub>a</sub> / R) · (1/T<sub>1</sub> − 1/T<sub>2</sub>)</div>
        `,
        theoryPoints: [
          "反应物浓度增大，单位体积内分子总数增多，单位时间碰撞频率成比例上升。",
          "温度升高，能量超过活化能 E_a 的活化分子百分数呈指数级激增，导致速率常数 k 显著增大。",
          "催化剂（如原子层沉积表面催化或贵金属辅助化学刻蚀 MACE）通过改变反应路径降低活化能 E_a，但不改变热力学平衡常数 K°。"
        ],
        icConnection: "在<strong>湿法刻蚀</strong>（如热磷酸刻蚀 Si₃N₄）与<strong>热氧化 Deal-Grove 模型</strong>中，表面化学反应控制区的速率严格遵循阿伦尼乌斯定律：温度波动仅 2°C 就可能造成片间刻蚀厚度偏差超过 5%！",
        guideSteps: [
          "拖动温度 T、反应物浓度 [C] 与催化剂开关，观察左侧反应势能面曲线（活化能垒高度 E_a）与右侧玻尔兹曼高能分子阴影面积变化。",
          "观察下方微观分子热运动与有效碰撞发光动画，对比催化前后速率常数 k 的倍数差异。"
        ],
        quizzes: [
          {
            q: "在金属辅助化学刻蚀硅（MACE，以 Au/Ag 纳米颗粒作催化剂）过程中，催化剂加快反应速率的根本原因是：",
            options: ["使反应焓变 ΔH 更负", "增大了反应物分子的平均动能", "改变了反应历程，显著降低了反应的活化能 E_a", "增大了正向平衡常数 K°"],
            answer: 2,
            explain: "催化剂参与中间配位/电子转移步骤，提供更低能垒的过渡态路径（降低 E_a），使活化分子分数大幅增加。"
          }
        ]
      }
    ]
  },

  /* ==================== 第二章：溶液与离子平衡 ==================== */
  {
    id: "ch2",
    shortTitle: "第二章 溶液与离子平衡",
    fullTitle: "第二章：溶液与离子平衡 (Solution and Ionic Equilibrium)",
    weeks: "第4–6周 (14学时含实验)",
    cases: [
      {
        id: "ch2-conc",
        title: "2.1 溶液浓度的五种表示方法与电子化学品配比换算",
        shortDesc: "质量分数 w、体积分数 φ、物质的量浓度 c、质量摩尔浓度 b、摩尔分数 x",
        syllabusRef: "第二章 (1) 溶液浓度的表示方法",
        levels: ["掌握"],
        objectives: [
          { level: "掌握", text: "质量分数 w、体积分数 φ、物质的量浓度 c、质量摩尔浓度 b、摩尔分数 x 的定义及相互换算关系。" }
        ],
        formulaHtml: `
          <div>c = (1000 · ρ · w) / M &nbsp;(mol·L<sup>−1</sup>) &nbsp;&nbsp;|&nbsp;&nbsp; b = (1000 · w) / [M · (1 − w)] &nbsp;(mol·kg<sup>−1</sup>)</div>
          <div>x<sub>B</sub> = n<sub>B</sub> / (n<sub>B</sub> + n<sub>H₂O</sub>)</div>
        `,
        theoryPoints: [
          "物质的量浓度 c (mol/L) 与溶液体积有关，受温度热胀冷缩影响；质量摩尔浓度 b (mol/kg) 与质量分数 w 不随温度变化。",
          "工业超净高纯试剂（如 49% HF、29% NH₃·H₂O、30% H₂O₂、98% H₂SO₄）常以质量分数标注，工艺配液时需结合密度 ρ 精准换算为摩尔浓度。"
        ],
        icConnection: "晶圆<strong>RCA标准清洗液</strong>（SC-1: NH₄OH:H₂O₂:H₂O = 1:1:5 体积比；SPM 食人鱼洗液 H₂SO₄:H₂O₂）及<strong>49 wt% 电子级氢氟酸稀释</strong>均依赖精准的浓度体系换算。",
        guideSteps: [
          "选择常见集成电路湿电子化学品（HF、H₂O₂、H₂SO₄、TMAH 显影液、NaCl 标准液）。",
          "调节质量分数 w (%) 和温度，实时查看 c、b、x 的自动换算结果及容量瓶分子密度视觉呈现。"
        ],
        quizzes: [
          {
            q: "半导体光刻显影标准液采用质量分数 w = 2.38% 的四甲基氢氧化铵（TMAH，摩尔质量 M ≈ 91.15 g/mol，密度 ρ ≈ 1.00 g/mL），其物质的量浓度 c 约为：",
            options: ["0.026 mol/L", "0.261 mol/L", "2.38 mol/L", "1.05 mol/L"],
            answer: 1,
            explain: "由 c = 1000·ρ·w / M = 1000 × 1.00 × 0.0238 / 91.15 ≈ 0.261 mol/L（即工业界熟知的 0.26 N TMAH 标准显影液！）。"
          }
        ]
      },
      {
        id: "ch2-colligative",
        title: "2.2 稀溶液的依数性与超纯水反渗透制备原理",
        shortDesc: "蒸气压下降 Δp、沸点升高 ΔT_b、凝固点降低 ΔT_f 与渗透压 Π 仿真",
        syllabusRef: "第二章 (2) 稀溶液的依数性",
        levels: ["掌握", "理解"],
        objectives: [
          { level: "掌握", text: "难挥发非电解质稀溶液的四大依数性规律及定量计算公式。" },
          { level: "理解", text: "饱和蒸气压、沸点、凝固点、渗透压的物理图像及反渗透（RO）脱盐原理。" }
        ],
        formulaHtml: `
          <div>Δp = p<sub>A</sub><sup>*</sup> · x<sub>B</sub> &nbsp;|&nbsp; ΔT<sub>b</sub> = K<sub>b</sub> · b<sub>B</sub> &nbsp;|&nbsp; ΔT<sub>f</sub> = K<sub>f</sub> · b<sub>B</sub> &nbsp;|&nbsp; Π = c<sub>B</sub>RT</div>
        `,
        theoryPoints: [
          "依数性仅取决于单位体积/质量溶剂中所含溶质粒子的数目，而与溶质的化学本性无关。",
          "溶质存在使溶剂表面摩尔分数降低，饱和蒸气压曲线整体下移，从而同时引发沸点升高（ΔT_b > 0）和凝固点降低（ΔT_f > 0）。",
          "在浓溶液一侧施加大于渗透压 Π 的外压（P_ext > Π），水分子将逆向穿过半透膜进入纯水侧，即为反渗透（Reverse Osmosis）。"
        ],
        icConnection: "集成电路晶圆厂每小时消耗数百吨 <strong>18.2 MΩ·cm 超纯水 (UPW)</strong>，其前端核心脱盐工序正是高压<strong>双级反渗透 (RO)</strong>，必须克服原水离子产生的渗透压 Π。",
        guideSteps: [
          "调节溶质质量摩尔浓度 b，观察左侧水的 p-T 相图上蒸气压曲线下移导致的 T_f 左移与 T_b 右移。",
          "调节右侧半透膜外加压强 P_ext：对比 P_ext < Π（正向渗透液面上升）与 P_ext > Π（反渗透制备超纯水）！"
        ],
        quizzes: [
          {
            q: "298 K 时，某难挥发非电解质稀溶液浓度为 0.10 mol/L（R = 8.314 J·mol⁻¹·K⁻¹），其渗透压 Π 约为：",
            options: ["24.8 kPa", "247.8 kPa", "2.48 MPa", "8.31 kPa"],
            answer: 1,
            explain: "Π = cRT = 0.10 mol/L × 8.314 × 298 K ≈ 247.8 kPa（注意 c 取 mol/L 时结果单位为 kPa，约合 2.45 个大气压）。"
          }
        ]
      },
      {
        id: "ch2-buffer",
        title: "2.3 酸碱质子理论与 BOE 缓冲氧化物刻蚀液机理",
        shortDesc: "共轭酸碱对、质子转移平衡与 HF/NH₄F 缓冲溶液稳 pH/稳刻蚀速率仿真",
        syllabusRef: "第二章 (3) 酸碱质子理论、酸和碱的质子转移平衡、缓冲溶液",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "酸碱质子理论（凡能给出质子H⁺者为酸，接受质子者为碱）、水的离子积 K_w 与解离平衡移动。" },
          { level: "理解", text: "缓冲溶液的组成（弱酸及其共轭碱）、亨德森-哈塞尔巴尔赫方程及配制应用。" },
          { level: "了解", text: "共轭酸碱对、两性物质及酸碱反应实质（质子转移）。" }
        ],
        formulaHtml: `
          <div>HF + H<sub>2</sub>O ⇌ H<sub>3</sub>O<sup>+</sup> + F<sup>−</sup> &nbsp;(pK<sub>a</sub> = 3.17) &nbsp;&nbsp;|&nbsp;&nbsp; HF + F<sup>−</sup> ⇌ HF<sub>2</sub><sup>−</sup></div>
          <div>pH = pK<sub>a</sub> + lg( [F<sup>−</sup>] / [HF] )</div>
        `,
        theoryPoints: [
          "Brønsted-Lowry 酸碱理论中，HF 给出 H⁺ 后转化为其共轭碱 F⁻，二者构成共轭酸碱对 HF / F⁻。",
          "向弱酸 HF 中加入大量强电解质 NH₄F（同离子效应），不仅构成抗酸碱波动的缓冲体系，还能持续补充刻蚀 SiO₂ 真正起主导作用的活性物种 HF₂⁻。"
        ],
        icConnection: "芯片湿法刻蚀 SiO₂ 极少直接使用纯稀 HF（因反应消耗 HF 会使刻蚀速率随时间衰减且易破坏光刻胶附着），而是采用 <strong>BOE（Buffered Oxide Etch，如 NH₄F:HF = 6:1 或 7:1）缓冲刻蚀液</strong>，稳定 pH 与 [HF₂⁻] 浓度，实现恒定纳米级刻蚀速率！",
        guideSteps: [
          "调节 NH₄F 与 HF 的配比，并模拟向溶液中滴加少量强酸或刻蚀消耗 HF。",
          "对比【纯稀 HF 溶液】与【BOE 缓冲溶液】在反应过程中的 pH 漂移曲线和 SiO₂ 刻蚀速率稳定性！"
        ],
        quizzes: [
          {
            q: "在半导体 BOE（HF + NH₄F 水溶液）缓冲体系中，HF 的共轭碱以及维持刻蚀速率恒定的缓冲机制分别是：",
            options: [
              "共轭碱为 OH⁻；靠水自偶电离维持",
              "共轭碱为 NH₄⁺；靠氨气挥发维持",
              "共轭碱为 F⁻；大量 F⁻ 与 HF 构成共轭酸碱缓冲对并稳定生成 HF₂⁻ 活性粒子",
              "共轭碱为 H₂F⁺；靠强酸完全电离维持"
            ],
            answer: 2,
            explain: "HF 失去一个质子 H⁺ 得到共轭碱 F⁻；NH₄F 提供高浓度 F⁻ 构成 HF/F⁻ 缓冲体系，有效稳定 pH 和刻蚀活性物种 HF₂⁻ 浓度。"
          }
        ]
      },
      {
        id: "ch2-ksp",
        title: "2.4 难溶电解质的沉淀溶解平衡 (K_sp 与 Q_c 判据)",
        shortDesc: "溶度积规则、同离子效应与晶圆厂含氟/重金属废水分步除杂",
        syllabusRef: "第二章 (4) 难溶电解质的沉淀溶解平衡",
        levels: ["掌握", "理解"],
        objectives: [
          { level: "掌握", text: "溶度积常数 K_sp 表达式及溶度积规则（Q_c > K_sp 沉淀析出，Q_c < K_sp 沉淀溶解）。" },
          { level: "理解", text: "同离子效应对溶解度的显著降低作用及分步沉淀的计算。" }
        ],
        formulaHtml: `
          <div>CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq), &nbsp; K<sub>sp</sub> = [Ca<sup>2+</sup>][F<sup>−</sup>]<sup>2</sup> = 3.9 × 10<sup>−11</sup></div>
          <div>判据：Q<sub>c</sub> &gt; K<sub>sp</sub> 过饱和析出沉淀；&nbsp; Q<sub>c</sub> = K<sub>sp</sub> 饱和平衡；&nbsp; Q<sub>c</sub> &lt; K<sub>sp</sub> 不饱和无沉淀</div>
        `,
        theoryPoints: [
          "绝对不溶的物质是不存在的，难溶电解质在水中建立动态溶解-沉淀平衡。",
          "加入含相同离子的强电解质（如过量 Ca²⁺ 除 F⁻），可通过同离子效应将残留 F⁻ 浓度压低至环保排放限值以下。"
        ],
        icConnection: "晶圆厂刻蚀与清洗工段产生大量含氟废水（HF/BOE排液）及含铜废水，环保站核心化学工艺就是投加 <strong>CaCl₂ / Ca(OH)₂ 生成难溶 CaF₂ 晶核沉淀</strong>，利用同离子效应将氟离子降至达标线以下。",
        guideSteps: [
          "选择难溶盐体系（CaF₂ 除氟、AgCl 卤素检验、Cu(OH)₂ 除铜）。",
          "拖动阳离子与阴离子初始浓度滑块，实时对比 pQ_c 与 pK_sp，观察烧杯底部晶体析出动画与残留离子浓度计算。"
        ],
        quizzes: [
          {
            q: "在晶圆厂含氟废水处理池中，已达 CaF₂ 沉淀溶解平衡。为进一步降低上清液中残留的 [F⁻] 浓度，最有效的化学措施是：",
            options: ["加水稀释废水", "适量投加可溶性钙盐（如 CaCl₂）利用同离子效应促使平衡向沉淀方向移动", "滤除池底已生成的 CaF₂ 固体", "加入强酸 HNO₃ 降低 pH"],
            answer: 1,
            explain: "K_sp = [Ca²⁺][F⁻]² 恒温下为常数，增大 [Ca²⁺] 会使 [F⁻] = √(K_sp/[Ca²⁺]) 显著降低；而加酸会使 F⁻ 结合 H⁺ 生成 HF 反而促使 CaF₂ 溶解！"
          }
        ]
      },
      {
        id: "ch2-coord",
        title: "2.5 配位化合物与芯片铜互连配位平衡仿真",
        shortDesc: "内界/外界、配位数、稳定常数 K_f 及 Cu²⁺-NH₃ / 柠檬酸 / EDTA 配位竞争",
        syllabusRef: "第二章 (5) 配位平衡",
        levels: ["理解", "了解"],
        objectives: [
          { level: "理解", text: "配位化合物的组成（中心离子、配位体、配位原子、配位数）与配位平衡。" },
          { level: "了解", text: "配位化合物命名、累积稳定常数 K_f、配位平衡与沉淀/氧化还原平衡的耦合及应用。" }
        ],
        formulaHtml: `
          <div>Cu<sup>2+</sup> + 4NH<sub>3</sub> ⇌ [Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup> &nbsp;&nbsp;(K<sub>f</sub> = 2.1 × 10<sup>13</sup>)</div>
          <div>Cu<sup>2+</sup> + Y<sup>4−</sup>(EDTA) ⇌ [CuY]<sup>2−</sup> &nbsp;&nbsp;(K<sub>f</sub> = 6.3 × 10<sup>18</sup>)</div>
        `,
        theoryPoints: [
          "中心金属离子（多为具有空 d 轨道的过渡金属，如 Cu²⁺、Co²⁺、Ag⁺）接受配位体孤对电子形成配位共价键。",
          "稳定常数 K_f 越大，配离子越稳定，游离金属离子浓度越低，甚至能使难溶氢氧化物沉淀重新络合溶解（如 Cu(OH)₂ 溶于氨水形成深蓝色铜氨络离子）。"
        ],
        icConnection: "后道互连 <strong>大马士革铜电镀 (Damascene Cu Plating)</strong> 与 <strong>Cu-CMP 抛光后清洗液</strong> 中广泛使用有机胺、柠檬酸、甘氨酸等配位剂：既络合溶解表面氧化铜残留，又调控游离 Cu²⁺ 还原电位使亚微米沟槽实现无空洞超填充！",
        guideSteps: [
          "切换不同配位体（无配体、NH₃、柠檬酸根、EDTA），并调节配体过量浓度。",
          "观察中心 Cu²⁺ 八面体/平面正方形配位结构示意图、溶液真实呈色变化、游离 [Cu²⁺] 数量级骤降以及 Cu(OH)₂ 沉淀络合溶解全过程！"
        ],
        quizzes: [
          {
            q: "在配合物硫酸四氨合铜(II) [Cu(NH₃)₄]SO₄ 中，中心离子、配位原子和配位数分别是：",
            options: ["Cu²⁺、H 原子、4", "Cu²⁺、N 原子、4", "S⁶⁺、O 原子、4", "Cu²⁺、N 原子、5"],
            answer: 1,
            explain: "内界为 [Cu(NH₃)₄]²⁺，中心离子为 Cu²⁺，单齿配体 NH₃ 中具有孤对电子的 N 原子为配位原子，共 4 个 NH₃ 故配位数为 4。"
          }
        ]
      }
    ]
  },

  /* ==================== 第三章：金属元素与金属材料 ==================== */
  {
    id: "ch3",
    shortTitle: "第三章 金属元素与材料",
    fullTitle: "第三章：金属元素与金属材料 (Metal Elements and Metallic Materials)",
    weeks: "第7–9周 (6学时)",
    cases: [
      {
        id: "ch3-metals",
        title: "3.1 金属分类、过渡金属特性与酸碱/水/氧反应实验台",
        shortDesc: "黑色金属 vs 有色金属（轻/重/贵/稀有）及芯片互连金属 Al/Cu/W/Co/Pt 反应活性",
        syllabusRef: "第三章 (1) 金属的物理性质及分类，金属元素的化学性质，过渡金属元素",
        levels: ["掌握", "理解"],
        objectives: [
          { level: "掌握", text: "黑色金属（Fe、Cr、Mn）与有色金属的基本概念，有色金属的四大分类（轻、重、贵、稀有金属）。" },
          { level: "理解", text: "金属与氧气、水、非氧化性酸、氧化性酸及强碱（两性金属如 Al）的化学作用规律。" }
        ],
        formulaHtml: `
          <div>两性金属铝与强碱：2Al + 2NaOH + 6H<sub>2</sub>O → 2Na[Al(OH)<sub>4</sub>] + 3H<sub>2</sub>↑</div>
          <div>铜与稀硝酸：3Cu + 8HNO<sub>3</sub>(稀) → 3Cu(NO<sub>3</sub>)<sub>2</sub> + 2NO↑ + 4H<sub>2</sub>O</div>
        `,
        theoryPoints: [
          "工业上将铁（Fe）、铬（Cr）、锰（Mn）及其合金称为黑色金属；其余所有金属统称有色金属（细分为轻有色金属 ρ<4.5 g/cm³ 如 Al/Mg/Ti、重有色金属如 Cu/Ni/Zn、贵金属如 Au/Ag/Pt、稀有金属如 W/Mo/Ta/稀土）。",
          "过渡金属具有未充满的 (n-1)d 轨道，普遍具有高熔点、高导电导热性、多变氧化态、易形成配合物及优异催化性能。"
        ],
        icConnection: "集成电路电极与互连演进史就是一部金属化学史：早期采用<strong>铝互连 (Al，轻金属，两性易被显影碱液 TMAH 腐蚀！)</strong> → 130nm 以后转向<strong>铜互连 (Cu，重有色金属，电阻率 1.68 μΩ·cm)</strong> → 7nm/3nm 最底层局部互连引入<strong>钴/钌 (Co/Ru，抗电迁移过渡金属)</strong>，接触孔塞则采用高熔点<strong>钨 (W，熔点 3422°C)</strong>。",
        guideSteps: [
          "点击选择不同金属样品（Fe、Al、Cu、W、Pt、Na）并查看其分类、电阻率、熔点与d电子构型。",
          "选择试剂（干燥O₂、纯水、稀HCl、稀HNO₃、NaOH/TMAH碱液）进行虚拟浸泡实验，观察气泡、钝化膜或溶解现象！"
        ],
        quizzes: [
          {
            q: "下列金属中，全部属于“有色金属”且在晶圆光刻后若直接暴露于碱性 TMAH 显影液中会发生两性溶解腐蚀的是哪一项中的铝(Al)？先判断：Fe、Cr、Mn 属于什么金属？",
            options: [
              "Fe、Cr、Mn 属于黑色金属；Al 属于轻有色金属且具两性，能与强碱反应放出 H₂",
              "Fe、Cu、W 属于黑色金属；Al 不与碱反应",
              "Cr、Ti、Pt 属于贵金属；Cu 能溶于稀盐酸放出 H₂",
              "只有 Fe 属于黑色金属，Cr 和 Mn 属于稀有金属"
            ],
            answer: 0,
            explain: "冶金与材料学中严格定义铁(Fe)、铬(Cr)、锰(Mn)为黑色金属，其余均为有色金属；Al 密度 2.70 g/cm³ 为轻有色金属，表面氧化膜及单质均能溶于强碱（包括 TMAH 显影液，这是铝电极工艺的经典禁忌）。"
          }
        ]
      },
      {
        id: "ch3-ti-ree",
        title: "3.2 钛及其化合物 (Ti/TiN/TiO₂) 与稀土元素光电/高k应用",
        shortDesc: "钛的抗蚀钝化、氮化钛扩散阻挡层与镧系稀土元素（CeO₂/La₂O₃/Er³⁺）通性",
        syllabusRef: "第三章 (2) 钛及其重要化合物，稀土元素",
        levels: ["掌握", "了解"],
        objectives: [
          { level: "掌握", text: "稀土元素（镧系15种 + Sc、Y 共17种）的电子构型通性、镧系收缩及其在光电/半导体中的核心应用。" },
          { level: "了解", text: "钛（Ti）的物理化学特性及重要化合物（TiO₂、TiCl₄、TiN）的性质与用途。" }
        ],
        formulaHtml: `
          <div>ALD 沉积氮化钛阻挡层：TiCl<sub>4</sub> + NH<sub>3</sub> → TiN(s) + HCl + N<sub>2</sub> (配平工艺反应)</div>
          <div>稀土通性：价电子构型 [Xe] 4f<sup>0–14</sup> 5d<sup>0–1</sup> 6s<sup>2</sup>，特征氧化态 +3，4f 电子受外层屏蔽产生尖锐 f–f 发光跃迁</div>
        `,
        theoryPoints: [
          "钛（Ti）密度小（4.51 g/cm³）、比强度极高，常温下表面生成致密 TiO₂ 钝化膜而极耐王水与海水腐蚀，但可溶于氢氟酸（生成 [TiF₆]²⁻）。",
          "稀土元素包含镧系（La–Lu 15种）及钪（Sc）、钇（Y）共17种元素。由于“镧系收缩”，原子半径随原子序数缓慢减小，化学性质极为相似，4f 轨道跃迁赋予其卓越的激光、荧光与磁性，且氧化物具有高介电常数。"
        ],
        icConnection: "① <strong>Ti / TiN 薄膜</strong>是芯片制造最经典的黏附层、扩散阻挡层及 FinFET 金属栅功函数调节层；② 稀土氧化物 <strong>CeO₂（氧化铈）</strong>是 STI 浅沟槽隔离 CMP 抛光液的核心磨料；<strong>La₂O₃</strong> 用于调节 NMOS 高 k 栅介质阈值电压；<strong>掺铒光纤放大器 (Er³⁺, 1550 nm)</strong> 是光通信芯片的基石！",
        guideSteps: [
          "在交互工作台中切换【钛基材料系 (Ti / TiO₂ / TiN)】与【稀土功能材料系 (La / Ce / Nd / Er / Y)】。",
          "观察晶圆薄膜截面堆叠模型与 4f 能级跃迁发射波长（如 Nd:YAG 1064nm、Er³⁺ 1550nm）及高k栅叠层介电常数提升效果。"
        ],
        quizzes: [
          {
            q: "关于稀土元素与钛化合物在集成电路与光电领域的应用，下列说法正确的是：",
            options: [
              "稀土元素仅包含周期表中部分主族元素，典型化合价为 +1 价",
              "金属钛常温下极易生锈粉化，完全不耐硝酸腐蚀",
              "稀土包含镧系15种元素及钪(Sc)、钇(Y)共17种；CeO₂常用于CMP抛光液，Er³⁺用于1550 nm光通信放大",
              "TiN（氮化钛）是典型的绝缘体，不能导电"
            ],
            answer: 2,
            explain: "稀土元素共17种（La-Lu + Sc + Y），特征氧化态 +3；TiN 具有金黄色金属光泽和优良导电性，广泛用作金属栅和接触孔扩散阻挡层。"
          }
        ]
      },
      {
        id: "ch3-alloys",
        title: "3.3 合金的结构类型与新型功能合金仿真",
        shortDesc: "置换/间隙固溶体、金属间化合物、芯片无铅焊料共晶与 Ni-Ti 记忆合金",
        syllabusRef: "第三章 (2) 合金材料；理解合金的结构和类型；了解新型合金材料",
        levels: ["理解", "了解"],
        objectives: [
          { level: "理解", text: "合金的三种基本相结构类型：固溶体（置换固溶体、间隙固溶体）、金属间化合物、机械混合物。" },
          { level: "了解", text: "新型合金材料（形状记忆合金 Ni-Ti、储氢合金 LaNi₅、微电子封装无铅焊料合金 SAC305 及 Al-Cu 抗电迁移互连合金）。" }
        ],
        formulaHtml: `
          <div>置换固溶体条件（Hume-Rothery）：Δr / r &lt; 15%，晶体结构相同，电负性与化合价相近</div>
          <div>典型芯片封装界面金属间化合物 (IMC)：Cu<sub>6</sub>Sn<sub>5</sub>、Ag<sub>3</sub>Sn</div>
        `,
        theoryPoints: [
          "固溶体保留溶剂金属晶格：溶质原子半径相近时取代晶格结点形成【置换固溶体】（如 Al 中掺 0.5% Cu）；小半径非金属原子（C、N、B、H）嵌入晶格空隙形成【间隙固溶体】。",
          "机械混合物由两种或多种晶相微区共晶组成，熔点通常低于各纯组分金属（共晶点效应）。"
        ],
        icConnection: "① 传统铝互连线通大电流时易发生铝原子电迁移断路，掺入 <strong>0.5%–2% Cu 形成 Al-Cu 合金</strong>可大幅抑制晶界扩散；② 芯片倒装焊（Flip-Chip BGA）凸点采用环保无铅共晶焊料 <strong>SAC305 (Sn-3.0Ag-0.5Cu，熔点约 217°C)</strong> 替代传统含铅焊料！",
        guideSteps: [
          "切换四种晶格微观模型：【纯金属】、【置换固溶体】、【间隙固溶体】、【金属间化合物】，调节溶质掺入比例与温度热振动。",
          "观察右侧二元共晶熔点降低曲线以及 Ni-Ti 形状记忆合金马氏体↔奥氏体相变恢复动画。"
        ],
        quizzes: [
          {
            q: "钢铁中的碳原子（半径很小）进入铁晶格的八面体或四面体空隙中所形成的单相固溶体属于：",
            options: ["置换固溶体", "间隙固溶体", "机械混合物", "非晶态高分子"],
            answer: 1,
            explain: "小半径原子（H、B、C、N）不占据主金属晶格阵点，而是嵌入晶格间隙中，属于典型的间隙固溶体。"
          }
        ]
      }
    ]
  },

  /* ==================== 第四章：非金属元素与无机非金属材料 ==================== */
  {
    id: "ch4",
    shortTitle: "第四章 非金属与半导体",
    fullTitle: "第四章：非金属元素与无机非金属材料 (Nonmetals and Inorganic Nonmetallic Materials)",
    weeks: "第10–11周 (4学时)",
    cases: [
      {
        id: "ch4-nonmetals",
        title: "4.1 非金属单质性质与硅基湿法/干法刻蚀化学对比",
        shortDesc: "F₂/Cl₂/O₂/Si/C 化学性质及 Si/SiO₂ 在 HF、KOH 与含氟等离子体中的反应选择比",
        syllabusRef: "第四章 (1) 非金属元素概述，非金属元素单质的物理和化学性质",
        levels: ["掌握"],
        objectives: [
          { level: "掌握", text: "无机非金属单质（卤素、氧、氮、碳、硅）的物理性质，以及与金属、氧（空气）、水、酸、碱等的作用规律。" }
        ],
        formulaHtml: `
          <div>硅与强碱各向异性腐蚀：Si + 2OH<sup>−</sup> + H<sub>2</sub>O → SiO<sub>3</sub><sup>2−</sup> + 2H<sub>2</sub>↑</div>
          <div>二氧化硅与氢氟酸：SiO<sub>2</sub> + 6HF → H<sub>2</sub>[SiF<sub>6</sub>] + 2H<sub>2</sub>O &nbsp;&nbsp;|&nbsp;&nbsp; 干法等离子体：Si + 4F· → SiF<sub>4</sub>(g)↑</div>
        `,
        theoryPoints: [
          "元素周期表右上角非金属电负性强、氧化性突出（F₂ 最强）；碳族元素 C（金刚石/石墨/石墨烯）与 Si 形成高熔点共价网状晶体。",
          "单质硅常温下化学性质稳定，不溶于单一的盐酸、硫酸或硝酸，但能溶于【氢氟酸+硝酸混合酸 (HNA)】（HNO₃先将Si氧化为SiO₂，HF随即络合溶解SiO₂）以及【强碱溶液（如 KOH、TMAH）】放出氢气！"
        ],
        icConnection: "MEMS 微纳加工与 CMOS 制造利用非金属化学反应的极致<strong>刻蚀选择比</strong>：稀 HF 只刻蚀 SiO₂ 而几乎不伤单晶 Si（选择比 > 100:1）；热 KOH 溶液沿硅不同晶面速率差异极大（(100)面远快于(111)面），可精准刻蚀出 <strong>54.74° 倒金字塔 V 型槽</strong>；SF₆/CF₄ 干法等离子体则生成挥发性 SiF₄ 气体实现高深宽比图形转移！",
        guideSteps: [
          "在晶圆截面实验台上选择刻蚀体系：【稀 HF 溶液】、【热 KOH 碱液】、【HNA (HF+HNO₃) 混酸】、【SF₆ 等离子体干法刻蚀】。",
          "点击开始刻蚀，实时观察 SiO₂ 掩模层与单晶 Si 衬底的各向同性/各向异性截面形貌演变与气态产物！"
        ],
        quizzes: [
          {
            q: "单晶硅（Si）在室温下不溶于浓硝酸，也不单独溶于稀氢氟酸，却能迅速溶于 HF + HNO₃ 混合酸（HNA），其化学机理是：",
            options: [
              "HF 将 HNO₃ 还原为氨气从而溶解硅",
              "HNO₃ 作强氧化剂将表面 Si 氧化为 SiO₂，HF 随即与 SiO₂ 反应生成可溶性 H₂SiF₆ 不断露出新鲜硅表面",
              "混合后产生氢气将硅还原为硅烷 SiH₄",
              "硅仅发生物理溶解，无化合价变化"
            ],
            answer: 1,
            explain: "单独 HNO₃ 会使硅表面生成致密 SiO₂ 钝化膜阻止反应继续；加入 HF 后及时将钝化膜转化为可溶性氟硅酸 H₂[SiF₆]，氧化-络合循环使刻蚀高速进行。"
          }
        ]
      },
      {
        id: "ch4-band",
        title: "4.2 金属能带理论、本征半导体与 N/P 型掺杂导电机理",
        shortDesc: "导带/价带/禁带宽度 E_g、施主(P/As)/受主(B)能级、费米能级 E_F 与载流子仿真",
        syllabusRef: "第四章 (2) 半导体材料种类，本征半导体、杂质半导体；金属能带理论，半导体导电机理",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "半导体材料种类，本征半导体（电子-空穴成对激发）与 N 型、P 型杂质半导体的掺杂化学本质。" },
          { level: "理解", text: "固体能带理论（导带 E_c、价带 E_v、禁带宽度 E_g）区分导体、半导体与绝缘体的机理。" },
          { level: "了解", text: "温度与掺杂浓度对费米能级 E_F 及多数/少数载流子浓度（n·p = n_i²）的调控。" }
        ],
        formulaHtml: `
          <div>质量作用定律：n · p = n<sub>i</sub><sup>2</sup> &nbsp;&nbsp;|&nbsp;&nbsp; n<sub>i</sub> ∝ T<sup>3/2</sup> exp(−E<sub>g</sub> / 2k<sub>B</sub>T)</div>
          <div>Si (IVA族, 4价)：掺 VA族 (P, As) → 多余电子 → N型；&nbsp; 掺 IIIA族 (B) → 空穴受主 → P型</div>
        `,
        theoryPoints: [
          "导体价带未满或导带与价带重叠（E_g = 0）；绝缘体禁带极宽（如 SiO₂ 的 E_g ≈ 9 eV）；半导体禁带适中（室温 Si 的 E_g = 1.12 eV）。",
          "在本征硅（4个价电子形成共价键）中掺入微量五价磷（P）或砷（As），第5个价电子束缚极弱（电离能仅 ~0.045 eV），易跃迁入导带成为自由电子（N型半导体，费米能级靠近导带）。",
          "掺入三价硼（B）则缺少一个价电子形成空穴，极易接受邻近共价键电子（P型半导体，费米能级靠近价带）。"
        ],
        icConnection: "一切 CMOS 晶体管的源漏极、阱区及 PN 结均通过<strong>离子注入 (Ion Implantation)</strong> 向硅晶圆精确注入 <strong>¹¹B⁺（P型掺杂）</strong>或 <strong>³¹P⁺ / ⁷⁵As⁺（N型掺杂）</strong>并经快速热退火激活晶格位置，可将硅的电导率跨 8 个数量级精准调控！",
        guideSteps: [
          "切换材料模式：【金属导体】、【绝缘体 SiO₂】、【本征硅 Si】、【N型掺磷 Si:P】、【P型掺硼 Si:B】。",
          "拖动温度 T 与掺杂浓度滑块，同时观察左侧【共价键晶格电子/空穴运动】与右侧【能带图 E_c / E_F / E_v 及载流子浓度对数条】！"
        ],
        quizzes: [
          {
            q: "向高纯单晶硅（IVA族）中掺入百万分之一原子比例的硼元素（B，IIIA族），所形成的半导体类型及多数载流子分别是：",
            options: [
              "N型半导体，多数载流子为自由电子",
              "P型半导体，多数载流子为空穴，费米能级向价带顶移动",
              "本征半导体，电子与空穴浓度严格相等",
              "超导体，禁带宽度变为 0"
            ],
            answer: 1,
            explain: "硼原子最外层有 3 个价电子，与周围 4 个硅原子成键时缺少 1 个电子形成空穴（受主杂质），故形成以空穴导电为主的 P 型半导体。"
          }
        ]
      },
      {
        id: "ch4-laser-fiber",
        title: "4.3 激光材料、光纤全反射通信与超导材料特性",
        shortDesc: "粒子数反转受激辐射（含准分子光刻激光）、石英光纤 NA 全反射与超导临界温度 T_c",
        syllabusRef: "第四章 (2) 激光材料、光导材料、超导材料",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "激光材料分类、激光器核心三要素（工作物质、泵浦源、光学谐振腔）及受激辐射放大原理。" },
          { level: "理解", text: "光导纤维的结构组成（高折射率纤芯 n₁ + 低折射率包层 n₂）及全反射光通信原理。" },
          { level: "了解", text: "超导材料的零电阻效应、迈斯纳完全抗磁性、临界温度 T_c 及其在超导量子芯片中的应用。" }
        ],
        formulaHtml: `
          <div>受激辐射光子能量：hν = E<sub>2</sub> − E<sub>1</sub> = hc / λ &nbsp;&nbsp;|&nbsp;&nbsp; 光纤数值孔径：NA = √(n<sub>1</sub><sup>2</sup> − n<sub>2</sub><sup>2</sup>) = sin θ<sub>max</sub></div>
          <div>超导转变：T &lt; T<sub>c</sub> 时，电阻率 ρ = 0，磁感应强度 B = 0（迈斯纳效应）</div>
        `,
        theoryPoints: [
          "普通光源为自发辐射（非相干）；激光器通过泵浦源实现高能级【粒子数反转】，在谐振腔反馈下产生频率、相位、偏振和传播方向完全一致的【受激辐射光放大 (LASER)】。",
          "石英光纤纤芯掺 GeO₂ 提高折射率 n₁，包层掺 F/B 降低折射率 n₂（n₁ > n₂），当入射光满足全反射条件时，光脉冲在纤芯内以极低损耗（1550 nm 窗口约 0.2 dB/km）高速传输。"
        ],
        icConnection: "① 深紫外光刻机的心脏正是<strong>气体准分子激光器（KrF 248 nm、ArF 193 nm）</strong>；② 硅光芯片（Silicon Photonics）通过波导耦合高纯 SiO₂ 光纤实现数据中心 Tbps 级互连；③ 超导铝/铌（Nb, T_c = 9.2 K）约瑟夫森结是<strong>超导量子计算芯片</strong>的核心硬件！",
        guideSteps: [
          "在顶部切换三大新型无机非金属模块：【受激辐射激光谐振腔】、【石英光纤全反射传播】、【超导临界温度 T_c 与磁悬浮】。",
          "在激光模块调节泵浦功率观察粒子数反转阈值；在光纤模块调节入射角 θ 观察全反射与漏光临界角；在超导模块降温跨越 T_c 观察电阻突降为零与磁力线排斥！"
        ],
        quizzes: [
          {
            q: "石英光导纤维能够将光信号约束在纤芯内远距离低损耗传输，要求纤芯折射率 n₁ 与包层折射率 n₂ 满足什么条件？",
            options: [
              "n₁ < n₂，发生折射发散",
              "n₁ = n₂，光沿任意角度直线射出包层",
              "n₁ > n₂，且光在纤芯-包层界面的入射角大于全反射临界角 arcsin(n₂/n₁)",
              "纤芯必须涂满银反射镜而不依赖折射率差"
            ],
            answer: 2,
            explain: "全内反射发生的两个充要物理条件是：光从光密介质（高折射率纤芯 n₁）射向光疏介质（低折射率包层 n₂），且界面入射角大于临界角。"
          }
        ]
      }
    ]
  },

  /* ==================== 第五章：集成电路专用材料 ==================== */
  {
    id: "ch5",
    shortTitle: "第五章 IC专用材料",
    fullTitle: "第五章：集成电路专用材料 (Materials for Integrated Circuits)",
    weeks: "第12–15周 (8学时)",
    cases: [
      {
        id: "ch5-silicon",
        title: "5.1 电子级硅提纯、直拉单晶硅、晶体缺陷与 SOI/应变硅",
        shortDesc: "11N纯度西门子法、CZ直拉生长、单晶/多晶/外延硅、点/线缺陷及 SOI/应变硅结构",
        syllabusRef: "第五章 (1) 硅材料、硅片加工、硅材料中的缺陷与杂质；SOI材料、硅基应变硅",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "单晶硅、多晶硅、硅外延单晶薄膜的区别，硅晶体中的典型缺陷（空位/间隙点缺陷、位错线缺陷、氧/碳/重金属杂质）。" },
          { level: "理解", text: "集成电路对电子级硅材料纯度（9N–11N）与结晶完整性的严苛要求及硅片加工流程（拉晶→滚磨→切片→倒角→研磨→CMP抛光）。" },
          { level: "了解", text: "绝缘体上硅（SOI）抗闩锁低寄生电容优势及硅基应变硅（Strained-Si）提升载流子迁移率的原理。" }
        ],
        formulaHtml: `
          <div>三氯氢硅纯化路线：Si(粗) + 3HCl → SiHCl<sub>3</sub>(精馏提纯) + H<sub>2</sub> → Si(11N电子级多晶硅) + 3HCl</div>
          <div>应变硅原理：在弛豫 Si<sub>1−x</sub>Ge<sub>x</sub> 缓冲层上外延薄层 Si → 面内双轴拉伸应变 → 降低有效质量，提升电子迁移率 μ</div>
        `,
        theoryPoints: [
          "太阳能级硅纯度约 6N（99.9999%），而集成电路电子级单晶硅纯度须高达 9N–11N（99.999999999%，杂质低于十亿分之一）！",
          "石英坩埚直拉法（CZ）生长的大尺寸（300 mm / 12英寸）单晶硅中常含微量间隙氧（来自 SiO₂ 坩埚微溶），适度内吸杂可捕获有害重金属离子（Fe、Cu、Au 深能级复合中心），但位错与层错穿过有源区会导致 PN 结漏电失效。"
        ],
        icConnection: "高端射频芯片与低功耗 FD-SOI 处理器采用 <strong>SOI（顶层单晶硅 / 埋氧层 BOX SiO₂ / 支撑硅衬底）</strong>彻底隔离衬底漏电；90nm 以下逻辑芯片普遍引入 <strong>SiGe 源漏压应变（增强 PMOS 空穴）与拉伸应变硅（增强 NMOS 电子）</strong>使晶体管开关速度提升 20%–50%！",
        guideSteps: [
          "切换查看四种硅基材料截面与晶格视图：【CZ直拉单晶硅与点/位错缺陷】、【多晶硅晶界对比】、【SOI 绝缘体上硅】、【SiGe 衬底拉伸应变硅】。",
          "调节缺陷密度或 Ge 组分比例 x，观察少子寿命、漏电流风险与载流子迁移率增益系数！"
        ],
        quizzes: [
          {
            q: "集成电路制造对单晶硅纯度要求高达 11N，其中若混入微量铁（Fe）、铜（Cu）、金（Au）等重金属杂质，对器件最致命的危害是：",
            options: [
              "使硅片颜色变成红色",
              "在硅禁带中央引入深能级复合中心，大幅缩短少数载流子寿命并导致 PN 结反向漏电流激增",
              "使硅转化为绝缘体二氧化硅",
              "仅略微增加硅片重量，对电学性能毫无影响"
            ],
            answer: 1,
            explain: "过渡/重金属原子在硅中扩散极快，且在禁带中部形成深能级陷阱（SRH复合中心），会导致栅氧击穿和结漏电剧增，故前道洁净室严格管控金属污染。"
          }
        ]
      },
      {
        id: "ch5-compound",
        title: "5.2 化合物半导体 (GaAs/GaN/SiC) 与量子阱/量子点材料",
        shortDesc: "二代/三代宽禁带化合物性质对比及量子限制效应波长连续可调荧光仿真",
        syllabusRef: "第五章 (2) 化合物半导体；化合物量子阱材料、化学量子点材料",
        levels: ["掌握", "了解"],
        objectives: [
          { level: "掌握", text: "IIIA-VA族（GaAs、InP、GaN）与 IVA-IVA族（SiC）等化合物半导体的键合特点、直接/间接带隙性质与核心应用。" },
          { level: "了解", text: "异质结化合物量子阱（Quantum Well）和胶体化学量子点（Quantum Dots）的量子尺寸效应及光电应用。" }
        ],
        formulaHtml: `
          <div>量子点有效带隙近似（Brus方程）：E<sub>g</sub>(R) ≈ E<sub>g,bulk</sub> + h<sup>2</sup> / (8 μ R<sup>2</sup>) − 1.8 e<sup>2</sup> / (4πε<sub>r</sub>ε<sub>0</sub>R)</div>
          <div>发光波长换算：λ (nm) ≈ 1240 / E<sub>g</sub> (eV)</div>
        `,
        theoryPoints: [
          "单晶硅是【间接带隙半导体】（E_g = 1.12 eV），发光效率极低；而 GaAs（1.42 eV）、InP（1.34 eV）、GaN（3.4 eV）属于【直接带隙半导体】，电子与空穴直接辐射复合发光效率极高，是激光器、LED 和高频射频芯片的核心材料。",
          "SiC（3.26 eV）与 GaN 属于第三代宽禁带半导体，击穿电场强度是硅的 8–10 倍，耐高温高压，主导新能源汽车电驱与快充功率芯片。",
          "当化学合成的半导体纳米晶（量子点，如 CdSe、InP）半径 R 小于激子玻尔半径时，粒径越小，有效带隙越宽，发光颜色由红光向绿光、蓝光连续蓝移！"
        ],
        icConnection: "<strong>InGaN/GaN 多量子阱</strong>造就了高亮度蓝白光 LED 与 Micro-LED 显示芯片；<strong>化学量子点 (QDs，2023年诺贝尔化学奖)</strong> 已大规模应用于 QLED 广色域显示屏与片上光电探测器！",
        guideSteps: [
          "在上方切换对比 Si、GaAs、InP、4H-SiC、GaN 五种半导体的禁带宽度、电子迁移率与击穿场强雷达指标。",
          "拖动下方【化学量子点粒径直径 D (2.0 nm – 8.0 nm)】滑块，实时观察能级分立间距、发射波长 λ (nm) 与真实光谱发光色彩渐变！"
        ],
        quizzes: [
          {
            q: "同一化学组成的胶体半导体量子点（如 InP 或 CdSe），当化学合成控制的纳米颗粒粒径逐渐减小时，其荧光发射波长和颜色将如何变化？",
            options: [
              "有效禁带变窄，波长变长（红移，偏向红光）",
              "有效禁带变宽，波长变短（蓝移，由红光向绿光、蓝光方向移动）",
              "发光波长只与元素种类有关，与粒径大小无关",
              "颗粒变小后变成金属导体而不再发光"
            ],
            answer: 1,
            explain: "由量子尺寸限制效应 ΔE ∝ 1/R²，量子点尺寸越小，电子和空穴受限越强，有效带隙 E_g 增大，由 λ = 1240/E_g 可知发光波长变短（蓝移）。"
          }
        ]
      },
      {
        id: "ch5-process-pkg",
        title: "5.3 工艺辅助材料（特气/湿化学品/CMP抛光液/靶材）与封装材料",
        shortDesc: "化学机械抛光 (CMP) 化学氧化+纳米磨料协同平坦化仿真与引线/塑封材料匹配",
        syllabusRef: "第五章 (3) 工艺辅助材料与封装结构材料",
        levels: ["理解"],
        objectives: [
          { level: "理解", text: "高纯电子特种气体、超净高纯化学试剂（SEMI G5级）、化学机械抛光液（CMP Slurry）、超高纯溅射靶材的作用与纯度要求。" },
          { level: "理解", text: "键合引线材料（Au、Cu、Al丝）及陶瓷封装、金属封装、环氧塑封料（EMC）的性能特点与热膨胀系数（CTE）匹配。" }
        ],
        formulaHtml: `
          <div>Preston 抛光速率方程：MRR = K<sub>p</sub> · P · V &nbsp;(耦合化学表面软化反应速率 k<sub>chem</sub>)</div>
          <div>热失配应力：σ<sub>th</sub> ∝ E · (α<sub>封装</sub> − α<sub>Si</sub>) · ΔT &nbsp;&nbsp;(α<sub>Si</sub> ≈ 2.6 ppm/K)</div>
        `,
        theoryPoints: [
          "单纯机械研磨会造成严重的晶圆表面划伤和亚表面晶格损伤；单纯化学腐蚀则是各向同性的，无法消除高低起伏实现全局平坦化。",
          "CMP 化学机械抛光液（含纳米 SiO₂/CeO₂/Al₂O₃ 磨料 + H₂O₂ 氧化剂 + 络合剂 + BTA 缓蚀剂）利用“化学反应在凸起处生成软质表面钝化层 → 抛光垫携磨料仅刮除凸起处钝化膜 → 凹陷处受缓蚀剂保护”的化学-机械协同机理实现亚纳米级全局平坦化！",
          "环氧塑封料（EMC）必须填充高达 70%–90 wt% 的球形熔融二氧化硅（SiO₂）微粉，才能将高分子树脂的热膨胀系数大幅压低至接近硅芯片（2.6 ppm/K），防止冷热循环翘曲开裂！"
        ],
        icConnection: "现代芯片多层铜互连多达 15 层以上，每层都必须经过 <strong>Cu/Barrier CMP 平坦化</strong>才能保证下一层光刻聚焦在超浅焦深（DOF）之内；后道封装中<strong>镀钯铜线 (Pd-coated Cu wire)</strong> 因高性价比与良好抗腐蚀性正广泛替代昂贵的金线键合。",
        guideSteps: [
          "调节 CMP 抛光液中的【氧化剂/络合剂化学活性】、【下压力 P】与【缓蚀剂浓度】，观察晶圆高低台阶全局平坦化过程及是否存在蝶形凹陷（Dishing）或划伤缺陷！",
          "调节右侧环氧塑封料中【球形硅微粉填充率 wt%】，查看热膨胀系数 CTE 失配引起的芯片热弯曲应力变化。"
        ],
        quizzes: [
          {
            q: "在芯片铜互连化学机械抛光（Cu-CMP）抛光液配方中，同时加入氧化剂（如 H₂O₂）、络合剂和缓蚀剂（如 BTA）的核心目的是：",
            options: [
              "完全依靠强酸溶解整片铜膜，无需抛光垫摩擦",
              "利用化学氧化生成易去除薄层、凸起处被机械磨除而凹陷处受缓蚀剂保护，实现高平整度无划伤全局平坦化",
              "使铜转化为绝缘的碳化硅",
              "增加晶圆表面粗糙度以提高光散射"
            ],
            answer: 1,
            explain: "CMP 的精髓在于化学腐蚀与机械研磨的协同平衡：凸起处摩擦剥离保护膜并经络合快速去除，凹处保留缓蚀膜不被下蚀，从而消除高低拓扑台阶。"
          }
        ]
      }
    ]
  },

  /* ==================== 第六章：光掩模和光刻胶材料 ==================== */
  {
    id: "ch6",
    shortTitle: "第六章 光掩模与光刻胶",
    fullTitle: "第六章：光掩模和光刻胶材料 (Photomask and Photoresist Materials)",
    weeks: "第16–17周 (4学时)",
    cases: [
      {
        id: "ch6-optics-mask",
        title: "6.1 光刻光谱演进、瑞利分辨率/焦深与 DUV/EUV 光掩模材料",
        shortDesc: "g/i-line→KrF→ArF浸没→EUV (13.5nm)、CD与DOF权衡及石英铬版 vs Mo/Si反射掩模",
        syllabusRef: "第六章 (1) 光刻基本知识：关键尺寸、光谱、分辨率、工艺宽度；极紫外光掩模要求及发展",
        levels: ["掌握", "理解", "了解"],
        objectives: [
          { level: "掌握", text: "曝光光源波长演进（436nm → 365nm → 248nm → 193nm → 13.5nm）及瑞利分辨率 R 与焦深 DOF 公式。" },
          { level: "理解", text: "浸没式光刻（超高纯水 n=1.44 将 NA 提升至 1.35）及极紫外（EUV）必须采用真空反射式 Mo/Si 多层膜掩模的化学物理原因。" },
          { level: "了解", text: "集成电路对光掩模基板材料（超低热膨胀高纯合成石英玻璃 Cr/MoSi 掩模 vs EUV 超低膨胀玻璃 ULE）的要求。" }
        ],
        formulaHtml: `
          <div>分辨率（最小关键尺寸 CD）：R = k<sub>1</sub> · λ / NA &nbsp;&nbsp;(NA = n · sin θ)</div>
          <div>焦深（工艺窗口纵向裕度）：DOF = ± k<sub>2</sub> · λ / NA<sup>2</sup></div>
        `,
        theoryPoints: [
          "缩小关键尺寸 CD 的三大途径：减小曝光波长 λ、增大投影物镜数值孔径 NA（如 193nm ArF 浸没式在镜头与晶圆间充入折射率 n=1.44 的超纯水）、降低工艺因子 k₁（相移掩模 PSM、光学邻近校正 OPC、多重图形）。",
          "注意分辨率与焦深的天然矛盾：增大 NA 虽能缩小 R（∝ 1/NA），却会使焦深 DOF 按 1/NA² 急剧缩窄，因此要求晶圆表面经 CMP 达到极致平整！",
          "当波长缩至极紫外 EUV（λ = 13.5 nm）时，包括空气和石英玻璃在内的几乎所有物质都会强烈吸收光子，因此必须在高真空中采用 40–50 对交替沉积的纳米级钼/硅（Mo/Si）布拉格多层膜反射式光掩模（反射率 ~70%）！"
        ],
        icConnection: "从微米级 MEMS 采用的 i-line (365 nm) 接触/接近式光刻，到 28nm–7nm 主力 <strong>193 nm ArF-i 浸没式光刻</strong>，再到 5nm/3nm/2nm 先进节点核心的 <strong>13.5 nm EUV 极紫外光刻</strong>，光掩模与光源化学材料直接定义了摩尔定律的极限。",
        guideSteps: [
          "切换曝光光源代际（g-line 436nm、i-line 365nm、KrF 248nm、ArF 干法 193nm、ArF 浸没式 193nm+UPW、EUV 13.5nm）。",
          "调节数值孔径 NA 与工艺因子 k₁，实时查看左上方【透射式石英铬掩模 vs 反射式 Mo/Si 多层膜 EUV 掩模】光路动画，以及右下方【分辨率 CD 与焦深 DOF 工艺窗口图】！"
        ],
        quizzes: [
          {
            q: "极紫外光刻（EUV，波长 13.5 nm）不能像 193 nm DUV 光刻那样使用石英玻璃透射式光掩模，而必须采用高真空 + Mo/Si 多层膜反射式光掩模，其根本原因是：",
            options: [
              "石英玻璃在 13.5 nm 下折射率太大导致色散",
              "13.5 nm 极紫外光子能量高达 ~92 eV，会被空气和石英等几乎一切固体材料强烈光电吸收而无法透射",
              "反射式光掩模制造成本比普通玻璃低得多",
              "Mo/Si 多层膜可以自发发出 13.5 nm 激光"
            ],
            answer: 1,
            explain: "13.5 nm EUV 光子能量高达 91.8 eV，高于绝大多数原子的外层电离能，穿过空气或石英基板即被强烈吸收衰减，故全光路及光掩模必须处于真空并采用布拉格相干反射。"
          }
        ]
      },
      {
        id: "ch6-nine-steps",
        title: "6.2 光刻工艺九大核心步骤全流程交互仿真",
        shortDesc: "清洗→HMDS增黏→旋涂匀胶→前烘→对准曝光→PEB后烘→显影→坚膜→CD检测",
        syllabusRef: "第六章 (2) 光刻的基本步骤；光刻胶物理特性；前烘、后烘的目的",
        levels: ["掌握"],
        objectives: [
          { level: "掌握", text: "光刻完整九步流程：晶圆清洗 → 脱水与HMDS增黏预处理 → 光刻胶旋涂 → 前烘(Soft Bake) → 对准与曝光 → 曝光后烘烤(PEB) → 显影 → 坚膜后烘(Hard Bake) → 图形检测。" },
          { level: "掌握", text: "光刻胶物理特性（黏度 η、固含量与旋涂转速 ω 对膜厚 d ∝ ω⁻¹/² 的调控）以及前烘、PEB、坚膜后烘各自的核心目的。" }
        ],
        formulaHtml: `
          <div>旋涂膜厚经验公式：d = k · C<sub>0</sub> · η<sup>γ</sup> / √ω &nbsp;&nbsp;(转速 ω 越高，光刻胶膜厚 d 越薄且越均匀)</div>
          <div>HMDS 表面硅烷化：(CH<sub>3</sub>)<sub>3</sub>Si-NH-Si(CH<sub>3</sub>)<sub>3</sub> + 2 Si-OH(亲水) → 2 Si-O-Si(CH<sub>3</sub>)<sub>3</sub>(疏水增黏) + NH<sub>3</sub>↑</div>
        `,
        theoryPoints: [
          "【HMDS 预处理】：洁净硅/SiO₂表面富含亲水硅羟基（-Si-OH），难以润湿有机光刻胶并易在显影时钻蚀脱胶；HMDS 气相处理将表面转化为疏水的三甲基硅氧基（-Si(CH₃)₃），大幅增强光刻胶附着力！",
          "【前烘 (Soft Bake, 90–110°C)】：挥发去除胶膜中大部分有机溶剂（如 PGMEA），使液态胶膜固化定型、增强附着并防止粘污掩模版（温度过高会导致感光剂热分解失效；过低则残留溶剂过多）。",
          "【曝光后烘烤 (PEB, Post-Exposure Bake)】：① 热扩散消除衬底反射引起的驻波条纹（Standing Wave）；② 对化学放大胶（CAR）驱动光致产酸剂（PAG）产生的 H⁺ 进行催化脱保护反应！",
          "【坚膜后烘 (Hard Bake, 120–140°C)】：挥发残余显影液与水分，使胶膜适度交联致密化，显著提高后续刻蚀或离子注入时的抗蚀耐受性。"
        ],
        icConnection: "晶圆厂黄光区将<strong>涂胶显影机 (Track)</strong>与<strong>光刻机 (Scanner/Stepper)</strong>联机封闭运行，九大步骤环环相扣，任何一步烘烤温度或旋涂转速偏离工艺窗口都会导致整批晶圆返工（Rework）。",
        guideSteps: [
          "逐步点击上方 1 → 9 光刻工序按钮，观察晶圆微观截面在每一步的实时物理与化学演化动画。",
          "调节【HMDS 开关】、【匀胶转速 RPM】、【前烘温度】与【PEB 开关】，观察如果漏做 HMDS（显影飘胶！）或不做 PEB（侧壁严重驻波锯齿！）会引发什么真实工艺缺陷！"
        ],
        quizzes: [
          {
            q: "在光刻流程中，旋涂光刻胶之后、曝光之前进行的“前烘（Soft Bake）”最主要的目的包括：",
            options: [
              "使单晶硅衬底熔化重结晶",
              "挥发去除胶膜中大部分有机溶剂（如 PGMEA），使光刻胶固化定型并提高与晶圆表面的附着力",
              "彻底碳化光刻胶使其无法被显影液溶解",
              "将正性光刻胶变成二氧化硅硬掩模"
            ],
            answer: 1,
            explain: "刚旋涂完的光刻胶含有大量溶剂（PGMEA等），前烘（Soft Bake）通过温和受热挥发溶剂使胶膜致密稳定、增强黏附力，避免粘连掩模或显影暗腐蚀过大。"
          },
          {
            q: "洁净的二氧化硅表面呈亲水性（富含 -Si-OH），在涂覆疏水性有机光刻胶前通入六甲基二硅氮烷（HMDS）蒸汽预处理的化学作用是：",
            options: [
              "增加表面水膜厚度",
              "通过硅烷化反应将亲水 -Si-OH 转化为疏水 -O-Si(CH₃)₃ 基团，显著提升光刻胶附着力防止显影脱胶",
              "直接作为显影液溶解未曝光区域",
              "吸收紫外光防止衬底反射"
            ],
            answer: 1,
            explain: "HMDS 与表面羟基发生硅烷化取代反应生成非极性三甲基硅氧基团，匹配有机光刻胶的表面能，接触角由 <15° 增至 ~75°，有效杜绝显影钻蚀浮胶。"
          }
        ]
      },
      {
        id: "ch6-resist-chem",
        title: "6.3 正性/负性光刻胶化学机理、对比度曲线与配套试剂安全",
        shortDesc: "DNQ重氮萘醌Wolff重排 vs CAR化学放大催化脱保护 vs 负胶交联、配套试剂与GHS安全",
        syllabusRef: "第六章 (3) 正性光刻胶、负性光刻胶的区别；光刻胶配套试剂；发展趋势及安全性",
        levels: ["理解", "了解"],
        objectives: [
          { level: "理解", text: "正性光刻胶（DNQ-Novolac 体系与 DUV/EUV 化学放大胶 CAR 体系）和负性光刻胶在光化学机理、显影行为、分辨率、抗蚀性及应用场景上的核心差异。" },
          { level: "了解", text: "光刻胶四大核心组分（成膜树脂、感光剂/产酸剂、溶剂 PGMEA、添加剂）、配套试剂（HMDS、EBR 洗边剂、2.38% TMAH 无金属显影液、剥离液）及化学品安全防护。" }
        ],
        formulaHtml: `
          <div>经典正胶 (g/i-line)：DNQ(疏水阻溶) + hν + H<sub>2</sub>O → 茚酮(Wolff重排) → 茚羧酸(亲水，溶于碱性 TMAH)</div>
          <div>化学放大正胶 (CAR, 248/193nm)：PAG + hν → H<sup>+</sup>；&nbsp; Polymer-O-tBOC + H<sup>+</sup>(PEB催化) → Polymer-OH(碱溶) + 异丁烯↑ + H<sup>+</sup>(再生!)</div>
          <div>负性光刻胶：线性预聚物 + 交联剂 + hν → 三维体型交联网状高分子（曝光区不溶于显影液）</div>
        `,
        theoryPoints: [
          "【正性光刻胶 (Positive Resist)】：曝光区发生光解重排（DNQ→茚羧酸）或酸催化脱保护基团（CAR），在碱性显影液中溶解度激增数千倍而被洗去，留下与掩模版相同的图形；不发生溶胀，分辨率极高，主导超大规模集成电路前道图形化。",
          "【负性光刻胶 (Negative Resist)】：曝光区发生自由基聚合或环氧开环交联（如 SU-8 厚胶），分子量暴增而不溶于显影液，未曝光区被洗去，得到与掩模版互补反相的图形；附着力与耐酸碱能力强、成本低，但溶剂显影易溶胀变形，常用于厚胶 MEMS 微流控、凸点电镀（Bumping）及钝化层开窗。",
          "【为何芯片厂严禁使用 NaOH/KOH 显影而必须用 TMAH？】因为 Na⁺、K⁺ 碱金属离子一旦扩散进入栅氧化层 SiO₂，会在电场下漂移导致 MOSFET 阈值电压严重不稳定！有机碱四甲基氢氧化铵 (CH₃)₄N⁺OH⁻ 完全不含金属离子。"
        ],
        icConnection: "248nm/193nm 准分子激光能量昂贵，<strong>化学放大光刻胶 (CAR)</strong> 利用 1 个光子产生的 1 个 H⁺ 在 PEB 烘烤时连续催化数百个保护基团断裂（量子产率放大百倍），兼顾了超高灵敏度与纳米级分辨率！同时 TMAH 具有强皮肤渗透神经毒性，PGMEA 易燃，实验室操作须严格佩戴丁腈/氯丁橡胶手套并在通风排风黄光橱内作业。",
        guideSteps: [
          "切换三大光刻胶化学体系：【DNQ-酚醛树脂正胶】、【DUV 化学放大正胶 (CAR)】、【交联型负性光刻胶 (如 SU-8)】。",
          "拖动曝光剂量 E (mJ/cm²)，观察左侧分子键断裂/重排/交联微观动画，以及右侧【归一化留膜率对比度曲线（γ 曲线）】与配套试剂 GHS 安全卡！"
        ],
        quizzes: [
          {
            q: "现代集成电路制造普遍使用 2.38% 四甲基氢氧化铵（TMAH）水溶液作为正胶显影液，而严格禁止使用廉价的 NaOH 或 KOH 溶液，根本原因是：",
            options: [
              "NaOH 和 KOH 碱性太弱，无法溶解茚羧酸",
              "Na⁺、K⁺ 属于可动碱金属污染离子，一旦进入芯片栅介质层会导致晶体管阈值电压漂移失效；TMAH 为无金属离子有机强碱",
              "TMAH 完全无毒且可直接徒手接触",
              "NaOH 会把硅片变成金属钠"
            ],
            answer: 1,
            explain: "MOS 器件栅氧化层对可动碱金属离子（Na⁺、K⁺、Li⁺）极度敏感，十亿分之一的污染即可造成致命阈值漂移，因此前道光刻必须使用无金属离子的 TMAH（注意 TMAH 有皮肤毒性，操作仍需严格防护）。"
          }
        ]
      }
    ]
  },

  /* ==================== 第七模块：课内实践（五大必做实验项目） ==================== */
  {
    id: "labs",
    shortTitle: "🧪 课内实践实验 (5项必做)",
    fullTitle: "课内实践内容：《集成工艺化学实验》五大必做实验项目交互实训",
    weeks: "第1–5周课内实践 (共18学时，占总评30%)",
    cases: [
      {
        id: "lab1-safety-nacl",
        title: "实验一：实验室安全教育与基础化学实验操作（配制 200mL 0.1mol/L NaCl 及测密度）",
        shortDesc: "PPE安全防护、玻璃器皿洗涤、万分之一电子天平称量、容量瓶定容与移液管测密度",
        syllabusRef: "必做实验项目一（4学时，综合性）",
        levels: ["必做实验"],
        objectives: [
          { level: "必做实验", text: "掌握化学与微纳实验室安全规范、防护穿戴与酸碱溅洒紧急处置措施。" },
          { level: "必做实验", text: "掌握常规玻璃器皿洗涤干净的判据（内壁水膜均匀既不聚成水滴也不成股流下）。" },
          { level: "必做实验", text: "掌握万分之一电子天平称量、200 mL 0.1000 mol/L NaCl 标准溶液配制及移取 10.00 mL 测定液体密度的完整操作。" }
        ],
        formulaHtml: `
          <div>所需 NaCl 理论质量：m = c · V · M = 0.1000 mol/L × 0.2000 L × 58.44 g/mol = <strong>1.1688 g</strong></div>
          <div>溶液密度测定：ρ = (m<sub>称量瓶+10mL液</sub> − m<sub>空称量瓶</sub>) / 10.00 mL &nbsp;(20°C 理论值 ≈ 1.0023 g/mL)</div>
        `,
        theoryPoints: [
          "【安全红线】：进入实验室必须穿实验服、戴护目镜与防护手套；强酸强碱或 TMAH 沾染皮肤应立即用大量流动清水冲洗至少 15 分钟（TMAH 需用葡萄糖酸钙/专项医疗急救）并报告指导教师。",
          "【容量瓶定容核心规范】：烧杯溶解冷却后沿玻璃棒引流转移，洗涤烧杯和玻璃棒 2–3 次并入容量瓶；加水至距刻度线 1–2 cm 处改用胶头滴管逐滴滴加，平视使凹液面最低处与刻度线相切（严禁容量瓶加热或久存试剂）。"
        ],
        icConnection: "微电子超净间（Cleanroom）对化学品安全（HF、TMAH、易燃溶剂）与痕量配液精度的要求直接源自规范的基础定量分析实验素养。",
        guideSteps: [
          "按顺序完成 5 个实训工位：① 安全穿戴检查 → ② 玻璃器皿刷洗水膜检验 → ③ 万分之一电子天平去皮称取 ~1.1688 g NaCl → ④ 200 mL 容量瓶引流洗涤与胶头滴管平视定容 → ⑤ 10.00 mL 移液管移液称重计算密度 ρ！",
          "留意定容时【仰视/平视/俯视】对实际浓度与密度的定量误差影响。"
        ],
        quizzes: [
          {
            q: "在用 200 mL 容量瓶配制 0.1000 mol/L NaCl 溶液最后滴管定容时，若实验者“俯视”刻度线观察凹液面，会导致所配溶液的实际浓度：",
            options: ["偏高（实际加水量偏少，V_实际 < 200 mL）", "偏低（实际加水量偏多，V_实际 > 200 mL）", "完全准确无误差", "溶质质量减少"],
            answer: 0,
            explain: "从上往下俯视刻度线时，视线斜向下穿过刻度线看到液面，尚未达到真实 200 mL 体积便误以为到线，导致溶剂体积 V 偏小，由 c = n/V 可知浓度偏高。"
          }
        ]
      },
      {
        id: "lab2-nacl-purify",
        title: "实验二：氯化钠的提纯（溶解-化学沉淀除杂-抽滤-蒸发结晶与产率计算）",
        shortDesc: "粗盐中 SO₄²⁻/Mg²⁺/Ca²⁺ 沉淀试剂投加顺序设计、减压抽滤、蒸发皿控温结晶及纯度检验",
        syllabusRef: "必做实验项目二（4学时，设计性）",
        levels: ["必做实验"],
        objectives: [
          { level: "必做实验", text: "掌握粗盐溶解、化学沉淀法除去可溶性杂质离子（SO₄²⁻、Mg²⁺、Ca²⁺、K⁺）的试剂选择与严格先后顺序设计。" },
          { level: "必做实验", text: "掌握常压过滤/布氏漏斗减压抽滤、稀盐酸调 pH、加热台蒸发浓缩结晶（较多固体析出即停热余热蒸干）及产品纯度检验与产率计算。" }
        ],
        formulaHtml: `
          <div>① 除 SO<sub>4</sub><sup>2−</sup>：Ba<sup>2+</sup> + SO<sub>4</sub><sup>2−</sup> → BaSO<sub>4</sub>↓ &nbsp;&nbsp;|&nbsp;&nbsp; ② 除 Mg<sup>2+</sup>：Mg<sup>2+</sup> + 2OH<sup>−</sup> → Mg(OH)<sub>2</sub>↓</div>
          <div>③ 除 Ca<sup>2+</sup> 及过量 Ba<sup>2+</sup>：Ca<sup>2+</sup> + CO<sub>3</sub><sup>2−</sup> → CaCO<sub>3</sub>↓，Ba<sup>2+</sup> + CO<sub>3</sub><sup>2−</sup> → BaCO<sub>3</sub>↓（<strong>Na<sub>2</sub>CO<sub>3</sub> 必须在 BaCl<sub>2</sub> 之后加！</strong>）</div>
          <div>④ 过滤后加 HCl 调 pH=2~3 除过量 OH<sup>−</sup> 和 CO<sub>3</sub><sup>2−</sup>；&nbsp; 产率 η = (m<sub>精盐</sub> / m<sub>粗盐</sub>) × 100%</div>
        `,
        theoryPoints: [
          "除杂铁律：不引入无法去除的新杂质！为除尽 SO₄²⁻ 需滴加【稍过量 BaCl₂】，因此后续必须加入【过量 Na₂CO₃】同时除去原粗盐中的 Ca²⁺ 和前一步引入的过量 Ba²⁺！若颠倒先加 Na₂CO₃ 后加 BaCl₂，滤液中将残留有毒 Ba²⁺ 导致产品纯度检验不合格！",
          "同样，必须【先过滤掉 BaSO₄、Mg(OH)₂、CaCO₃、BaCO₃ 沉淀，再向滤液滴加稀盐酸调酸】；若未过滤就加盐酸，刚生成的碳酸盐和氢氧化镁沉淀会重新溶解返入溶液！",
          "蒸发浓缩时切忌大火烧干至迸溅，应在蒸发皿出现较多晶体、剩少量母液时调低/关闭加热台利用余热蒸干。"
        ],
        icConnection: "粗盐多级化学提纯的“除杂顺序逻辑、痕量离子检验与重结晶分凝”正是工业制备<strong>超净高纯电子级无机盐与高纯硅前驱体</strong>的核心化学工程思维。",
        guideSteps: [
          "在虚拟设计实验台中亲自点击决定试剂投加与过滤顺序（试试正确顺序 vs 故意把 BaCl₂ 放在 Na₂CO₃ 后面或未过滤先加 HCl，观察系统的实时离子追踪诊断！）。",
          "完成加热台蒸发结晶，滴加 Na₂SO₄ 检验精盐溶液中是否残留 Ba²⁺，读取天平质量计算提纯产率 η。"
        ],
        quizzes: [
          {
            q: "在氯化钠提纯设计实验中，关于除杂试剂 BaCl₂、Na₂CO₃ 和稀 HCl 的加入时机，下列操作完全正确的是：",
            options: [
              "先加过量 Na₂CO₃ → 再加过量 BaCl₂ → 过滤 → 加稀 HCl 蒸发",
              "先加过量 BaCl₂ → 再加过量 NaOH 和 Na₂CO₃ → 不过滤直接加过量稀 HCl → 蒸发结晶",
              "先加过量 BaCl₂ → 再加过量 NaOH 和 Na₂CO₃ → 过滤除去全部沉淀后 → 向清亮滤液滴加稀 HCl 调微酸性 → 蒸发结晶",
              "只加热蒸发即可除去所有可溶性 Ca²⁺、Mg²⁺、SO₄²⁻"
            ],
            answer: 2,
            explain: "Na₂CO₃ 必须在 BaCl₂ 之后加入以除去过量 Ba²⁺；且必须先过滤分离沉淀后再向滤液加稀 HCl 除去过量 OH⁻ 与 CO₃²⁻（受热挥发多余 HCl），否则沉淀遇酸复溶。"
          }
        ]
      },
      {
        id: "lab3-titration",
        title: "实验三：溶液的配制及酸碱滴定（标准液标定、滴定终点与待测浓度计算）",
        shortDesc: "酸式/碱式滴定管准备、酚酞/甲基橙指示剂变色仿真、半滴控制与 pH 突跃曲线同步绘制",
        syllabusRef: "必做实验项目三（4学时，设计性）",
        levels: ["必做实验"],
        objectives: [
          { level: "必做实验", text: "掌握酸式滴定管（玻璃旋塞，装酸/氧化性溶液）与碱式滴定管（乳胶管玻璃珠，装碱液）的检漏、洗涤、待装液润洗 2–3 次、排尖嘴气泡与调零。" },
          { level: "必做实验", text: "掌握标准溶液标定、滴定终点微粉红/橙色 30 秒不褪色判据、0.01 mL 估读及三次平行滴定待测液浓度与相对平均偏差计算。" }
        ],
        formulaHtml: `
          <div>等物质的量反应关系（NaOH 滴定 HCl）：c<sub>HCl</sub> · V<sub>HCl</sub> = c<sub>NaOH</sub> · V<sub>NaOH</sub></div>
          <div>滴定管读数精度：最小分度 0.1 mL，必须估读至小数点后两位（如 <strong>20.04 mL</strong>）</div>
        `,
        theoryPoints: [
          "滴定管洗净后若未用待装标准溶液润洗 2–3 次（每次 5–10 mL），管壁残留纯水会稀释标准溶液，导致消耗滴定体积偏大、测得待测液浓度偏高！相反，锥形瓶绝不能用待测液润洗！",
          "强碱（0.1000 mol/L NaOH）滴定强酸（20.00 mL 待测 HCl）时，化学计量点前后 ±0.02 mL（仅半滴！）内 pH 从 4.3 骤跃至 9.7，酚酞指示剂由无色突变为浅粉红色且摇匀 30 s 不褪色即为终点。"
        ],
        icConnection: "晶圆厂湿法清洗槽与刻蚀槽（SC-1、SPM、H₃PO₄、BOE）配备在线自动电位/光度<strong>化学滴定分析仪 (Auto-Titrator)</strong>，24 小时实时监控槽液酸碱组分浓度并自动补液。",
        guideSteps: [
          "完成滴定管准备（润洗+排气泡），选择指示剂（酚酞 / 甲基橙）。",
          "使用【快速滴加 (+1.00 mL)】、【逐滴 (+0.05 mL)】与接近终点时的【半滴精控 (+0.02 mL)】按钮进行滴定！",
          "观察左侧锥形瓶溶液真实色彩渐变、右侧同步绘制的 pH–V 滴定突跃曲线及放大弯月面刻度读数，校验过量滴定（深洋红色警告）与精准终点！"
        ],
        quizzes: [
          {
            q: "用标准 NaOH 溶液滴定未知浓度的 HCl 溶液时，下列操作中不会引起系统误差（即操作正确）的是：",
            options: [
              "将标准 NaOH 溶液装入带磨口玻璃旋塞的酸式滴定管中长期使用",
              "碱式滴定管用蒸馏水洗净后，不经标准 NaOH 溶液润洗直接装液滴定",
              "锥形瓶用蒸馏水洗净后瓶底留有少量水珠，未烘干便直接用移液管移入 20.00 mL 待测 HCl 溶液进行滴定",
              "滴定前碱式滴定管尖嘴处留有大气泡，滴定结束后气泡消失"
            ],
            answer: 2,
            explain: "锥形瓶中残留少量纯水不改变移液管移入的待测 HCl 总物质的量 n = c·V，因此对滴定终点消耗的 NaOH 体积毫无影响；其余三项分别是粘连玻璃塞、稀释标准液（偏高）、气泡体积计入读数（偏高）。"
          }
        ]
      },
      {
        id: "lab4-pos-litho",
        title: "实验四：正性光刻胶图形化及光刻工艺流程实训",
        shortDesc: "匀胶机(Spin Coater)、加热台(Hotplate)、紫外曝光机(Mask Aligner)参数整定与正胶显影",
        syllabusRef: "必做实验项目四（4学时，设计性）",
        levels: ["必做实验"],
        objectives: [
          { level: "必做实验", text: "学习硅晶圆表面正性光刻工艺完整实操流程，认识正性光刻胶“曝光区溶解去除、未曝光区保留图形”的本质。" },
          { level: "必做实验", text: "掌握匀胶机两步转速设置（低速摊胶 + 高速匀胶）、加热台前烘控温、紫外光刻曝光机掩模对准与曝光剂量（功率×时间）调控方法。" }
        ],
        formulaHtml: `
          <div>曝光剂量 (Exposure Dose)：E (mJ/cm<sup>2</sup>) = I (mW/cm<sup>2</sup>) × t<sub>exp</sub> (s)</div>
          <div>正性光刻胶图形传递：掩模透光区 → 光解生成羧酸 → TMAH 显影溶解露出硅衬底；掩模遮光铬区 → 保留光刻胶线条</div>
        `,
        theoryPoints: [
          "匀胶机操作要点：晶圆置于吸盘正中央开启真空吸附（Vacuum），滴加光刻胶于中心避免气泡；第一阶段低速（如 500 rpm, 5 s）使光刻胶铺满晶圆，第二阶段高速（如 3000–4000 rpm, 30 s）甩除多余胶液获得均匀微米级薄膜。",
          "曝光剂量窗口：剂量不足（欠曝光）会导致底部光刻胶未完全感光而显影残留（Scumming / 不清底）；剂量过大（过曝光）则因衍射散射使正胶线条严重变窄甚至剥离消失！"
        ],
        icConnection: "本实验在学院微纳洁净实验室直接操作真实<strong>匀胶机、数显加热台与紫外光刻机</strong>，是微电子专业学生人生第一次亲手在硅晶圆上制造微米级集成电路几何图形的核心实训。",
        guideSteps: [
          "调节匀胶机高速转速（1500–5000 rpm）查看目标正胶膜厚（如 ~1.5 μm AZ系列正胶）。",
          "设定加热台前烘温度（推荐 100°C, 60–90s）、紫外光强 I (mW/cm²) 与曝光时间 t (s) 及显影时间。",
          "实时观察【掩模版图形】→【晶圆宏观俯视】→【金相显微镜微米线条形貌与横截面侧壁轮廓】评价得分！"
        ],
        quizzes: [
          {
            q: "在正性光刻胶图形化实验中，掩模版上是一组宽 10 μm 的不透光铬（Cr）线条（其余区域透光）。经标准曝光与 TMAH 显影后，硅晶圆表面留下的光刻胶图形是：",
            options: [
              "整片晶圆光刻胶全部被洗掉",
              "对应铬遮光区留下一组宽约 10 μm 的凸起光刻胶线条，透光区硅衬底裸露出来",
              "透光区保留光刻胶，而铬遮光区下方变成凹槽",
              "没有任何变化，需要加热到 1000°C 才显影"
            ],
            answer: 1,
            explain: "正性光刻胶曝光区（透光区下方）感光重排溶于显影液被去除，未曝光区（不透光铬线条遮挡处）保留下来，实现与掩模版同相（1:1极性）的图形转移。"
          }
        ]
      },
      {
        id: "lab5-neg-compare",
        title: "实验五：负性光刻胶图形化、显微镜对比表征与百分制实验考核",
        shortDesc: "负胶光交联参数调控、同掩模正胶 vs 负胶金相显微镜双视场测微标尺对比与大纲评分",
        syllabusRef: "必做实验项目五（2学时，设计性）及大纲考核评价标准",
        levels: ["必做实验"],
        objectives: [
          { level: "必做实验", text: "掌握负性光刻胶涂覆、曝光交联度控制、显影操作及微米尺度光刻图案显微镜观测拍照与线宽（CD）测量方法。" },
          { level: "必做实验", text: "深入对比同一块光掩模下正性光刻胶与负性光刻胶在图形极性（互补反相）、侧壁形貌（正胶微梯形 vs 负胶倒梯形/溶胀桥连）及工艺窗口上的差异。" }
        ],
        formulaHtml: `
          <div>同一掩模（铬遮光宽度 W<sub>mask</sub>）：正胶显影得<strong>凸起胶条</strong>；负胶显影得<strong>凹陷沟槽（透光区交联保留）</strong></div>
          <div>大纲单次实验百分制评分：预习(20%) + 现场操作(20%) + 数据采集与处理(40%) + 思考题(15%) + 报告印象(5%) = 100分</div>
        `,
        theoryPoints: [
          "负性光刻胶依靠光引发交联（或光生酸引发环氧开环交联，如 SU-8 需配合关键的 PEB 后烘完成交联）：若曝光剂量不足，底部未交联会导致显影时整条胶线从硅片根部漂浮脱落（倒塌剥离）！",
          "若负胶曝光过量或有机溶剂显影时间过长，聚合物网络吸收溶剂发生【溶胀效应 (Swelling)】，相邻微米线条膨胀接触形成“桥连（Bridging）”缺陷，限制了传统溶剂型负胶的极限分辨率。"
        ],
        icConnection: "掌握正负光刻胶互补图形设计与光学显微镜标尺线宽量测（CD Metrology），可直接衔接后续《集成电路制造工艺》中的湿法腐蚀图形转移与金属剥离（Lift-off，常偏好负胶或双层胶倒梯形侧壁！）工艺。",
        guideSteps: [
          "切换掩模版测试图案（微米线阵分辨率靶 / 接触孔阵列 / 芯片焊盘电路图），调节负胶曝光剂量与显影时间。",
          "在双筒金相显微镜并排视场中直接对比【正性光刻胶显影照片】与【负性光刻胶显影照片】，拖动目镜测微标尺读取实测线宽 CD (μm) 并填入数据表，一键生成按大纲权重核算的实验评估得分！"
        ],
        quizzes: [
          {
            q: "使用同一块印有“透明字母 IC（周围为不透光铬膜）”的光掩模版，分别对正性光刻胶晶圆和负性光刻胶晶圆进行标准曝光和显影，显微镜下观测到的结果是：",
            options: [
              "两片晶圆上都是凸起的光刻胶字母 IC",
              "正胶晶圆上“IC”处光刻胶被洗去形成凹陷露硅字样；负胶晶圆上“IC”处发生光交联保留为凸起的光刻胶字母，周围未曝光胶被洗去",
              "正胶晶圆保留凸起字母 IC；负胶晶圆整片溶解",
              "两种光刻胶图形完全相同，只是颜色不同"
            ],
            answer: 1,
            explain: "透明字母 IC 区域透光：正胶在透光区分解溶去形成凹陷露硅字母；负胶在透光区交联硬化保留为独立凸起的光刻胶字母，二者图形呈严格的黑白互补反相关系！"
          }
        ]
      }
    ]
  }
];
