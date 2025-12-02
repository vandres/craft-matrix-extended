# Release Notes for Matrix Extended

## [v5.1.0] - 2025-12-02

- feat(add): reintroduce add block above [`9a25af5`](https://github.com/vandres/craft-matrix-extended/commit/9a25af5385e274dac140513413cf25a0f4c55240)
- feat(add): first working version with less cloning and event forwarding [`e393db8`](https://github.com/vandres/craft-matrix-extended/commit/e393db8b3c9bb74c2a94f3d7c9cc98ffa603570a)
- fix(dragdrop): fixed issue of dragdrop in combination with the new native copy&paste functionality [`b47a525`](https://github.com/vandres/craft-matrix-extended/commit/b47a525d0b37305faf20d66b02f993f3c781f224)
- fix(dragdrop): drag&drop not initializing [`49dc648`](https://github.com/vandres/craft-matrix-extended/commit/49dc648cf5ce537f4a4fb7c7779ee72f86250dd4)
- feat(add): first working version with less cloning and event forwarding (build) [`d1aeb74`](https://github.com/vandres/craft-matrix-extended/commit/d1aeb74fd0eb1b128e02207f3369b9ba8c546c7b)
- feat(add): first working version with less cloning and event forwarding (build) [`02ded6a`](https://github.com/vandres/craft-matrix-extended/commit/02ded6a2db85a883e1de1fcc0cb5c1b743353d9e)

## [v5.0.0] - 2025-06-03

- feat(core): removed "Add Block Above", "Duplicate" and "Copy&Paste" features in favor of native Matrix functions [`eab1f31`](https://github.com/vandres/craft-matrix-extended/commit/eab1f313670dd5d1cfefd8c53f3de611120d9944)
- feat(setup): get rid of releases in CHANGELOG [`e00d815`](https://github.com/vandres/craft-matrix-extended/commit/e00d81537d1aa077b3e676ee9be61056fb3b2b7a)
- fix(dragdrop): fixed move handle not enabling drag&drop with 5.7 [`2782815`](https://github.com/vandres/craft-matrix-extended/commit/2782815e2e256ca0d91fb7bd5945827fe2d9b43e)

## [v4.2.1] - 2025-02-18

- feat(setup): new icon [`3b8a2c2`](https://github.com/vandres/craft-matrix-extended/commit/3b8a2c23a8b7966dcbfd56f80c0b29ee03f4b303)

## [v4.2.0] - 2025-02-11

- feat(add): allow ungrouped entry types to be hidden [`8528b6a`](https://github.com/vandres/craft-matrix-extended/commit/8528b6ad0a818a30bc6c074dc6c8810cba95f3df)

## [v4.1.0] - 2025-01-27

- feat(core): allow to disable core features [`e7516ad`](https://github.com/vandres/craft-matrix-extended/commit/e7516ad2a96807a7a9e37462107dff406b953ad3)
- feat(cards): promote to stable [`b1c56ae`](https://github.com/vandres/craft-matrix-extended/commit/b1c56ae388e664b9beacab78288f0efe648e181d)

## [v4.0.2] - 2024-12-09

- chore(dragdrop): added missing build files [`eabe68e`](https://github.com/vandres/craft-matrix-extended/commit/eabe68ec08115f031f281b65e1045587cbc33c52)

## [v4.0.1] - 2024-12-09

- feat(dragdrop): restored dragdrop target behaviour [`1f7f0b9`](https://github.com/vandres/craft-matrix-extended/commit/1f7f0b9f0f1fad686273bd014efd727249834dfe)

## [v4.0.0] - 2024-12-09

- feat(copy): added copy&paste for cards [`0bb608d`](https://github.com/vandres/craft-matrix-extended/commit/0bb608d3ed9a67c46b59b10166c5bddd3c292257)
- feat(duplicate): first working version for cards [`e2ca34d`](https://github.com/vandres/craft-matrix-extended/commit/e2ca34d90980ad0ed4beb8f3498f0dd1e0f154e9)
- feat(add): allow grouping of entry types (cards) [`29ba98f`](https://github.com/vandres/craft-matrix-extended/commit/29ba98f7eee496f3bc1d6364449e8d34b8989e09)
- fix(dragdrop): added missing drop target right before buttons [`a8721fa`](https://github.com/vandres/craft-matrix-extended/commit/a8721fadc8fa29117f159ae7259a583357f3168e)
- feat(duplicate): duplicate draft if existing (cards) [`378e787`](https://github.com/vandres/craft-matrix-extended/commit/378e78786f0918ed012a344d8837c13c6c51a692)
- fix(duplicate): wrong owner id is attached to cards, when they are duplicated and nested [`25efcd3`](https://github.com/vandres/craft-matrix-extended/commit/25efcd3727fda873167e5595f0c456bce41cbf7a)
- fix(global): take care, that "type-id" is on each card (cards) [`da41411`](https://github.com/vandres/craft-matrix-extended/commit/da414117887738f4b0883d9201e3870c31cbb8ae)
- feat(cards): start working on view mode "cards" [`faaf43c`](https://github.com/vandres/craft-matrix-extended/commit/faaf43c7465d1658c33546b6abb00192a9cde4eb)
- feat(duplicate): duplication works now together with drafts [`6084713`](https://github.com/vandres/craft-matrix-extended/commit/6084713a95d63420dd020c9039b7db1ce850c518)
- fix(duplicate): fixed hardcoded field attribute [`c0d7819`](https://github.com/vandres/craft-matrix-extended/commit/c0d7819e7deeb95427b5edadef254ae29420f406)
- chore(vite): added missing js files [`9c1dc83`](https://github.com/vandres/craft-matrix-extended/commit/9c1dc8370f4a86070228764b4d9014bc6d3451ef)
- docs(misc): added note about major version jump [`fb727b3`](https://github.com/vandres/craft-matrix-extended/commit/fb727b36a4efd83681b612922f81b07cf0fc0017)
- feat(duplicate): require Craft 5.5.5 [`fe6e38e`](https://github.com/vandres/craft-matrix-extended/commit/fe6e38ef1a9fb19a021d14f70ed2de6889a3ee58)

## [v3.6.4] - 2024-11-26

- fix(duplicate): nested matrix get duplicated twice [`4a70af4`](https://github.com/vandres/craft-matrix-extended/commit/4a70af4fad945e77d8f14983146ea862daec4ad8)
- fix(duplicate): nested matrix get duplicated twice [`441a83a`](https://github.com/vandres/craft-matrix-extended/commit/441a83ab88030f204e3743ca8af4135bfa783787)
- fix(duplicate): nested matrix get duplicated twice [`2726cd0`](https://github.com/vandres/craft-matrix-extended/commit/2726cd02d7a8d14145fec01e9af41acb434183bd)

## [v3.6.3] - 2024-11-25

- fix(dragdrop): only add drag and drop target, if there are blocks [`80c1389`](https://github.com/vandres/craft-matrix-extended/commit/80c13891687cdf10f3a7d9f25cf418bd1e235008)

## [v3.6.2] - 2024-11-25

- fix(add): add function is triggered twice in Craft 5.5.x [`8ee0fb2`](https://github.com/vandres/craft-matrix-extended/commit/8ee0fb2396cb6da991f5d3cc34563be594cb6028)

## [v3.6.1] - 2024-10-23

- fix(add): when adding an element above, while all other elements were removed [`93749cb`](https://github.com/vandres/craft-matrix-extended/commit/93749cb053a675cd17b52a3e663420f4fca70352)

## [v3.6.0] - 2024-10-23

- feat(add): allow to hide the default entry types in the disclosure menu [`d514116`](https://github.com/vandres/craft-matrix-extended/commit/d514116a35b6ecbbe2ab54dede93d70244b1bdc3)

## [v3.5.2] - 2024-10-22

- fix(copy): copy and paste were still checking for `experimentalFeatures` flag [`9470ab6`](https://github.com/vandres/craft-matrix-extended/commit/9470ab62a09724b5020f58d04ada041b03134835)

## [v3.5.1] - 2024-10-14

- fix(duplicate): respect site, when getting owner of duplication element [`e76385a`](https://github.com/vandres/craft-matrix-extended/commit/e76385a3afe5eba07b10c6bee5676e3481a2a6f1)

## [v3.5.0] - 2024-06-30

- feat(add): added option to manually decide about oneliner [`41ce674`](https://github.com/vandres/craft-matrix-extended/commit/41ce6743a82b7f7690f9479ce3d1e0384cf3ded7)

## [v3.4.3] - 2024-06-24

- fix(duplicate): duplication of nested asset and entry doesn't work [`3f60730`](https://github.com/vandres/craft-matrix-extended/commit/3f607304516ae04e415ee2e78635b46a1fc2b9c1)

## [v3.4.2] - 2024-06-18

- fix(add): allow grouped blocks to wrap [`17d65b9`](https://github.com/vandres/craft-matrix-extended/commit/17d65b96836e5dc4b09bc9c29b0347948a111f01)

## [v3.4.1] - 2024-06-17

- fix(add): bottom disclosure menus were only usable once [`9ae2d9b`](https://github.com/vandres/craft-matrix-extended/commit/9ae2d9b1d8c3373ecab0ba5933726ce7102eded5)
- docs(misc): add comment which point to source files [`f061372`](https://github.com/vandres/craft-matrix-extended/commit/f061372b55a54222543b94ee3ee9d9b429b6067b)

## [v3.4.0] - 2024-06-06

- feat(misc): disable initialization on non "blocks" matrix fields [`76aa25f`](https://github.com/vandres/craft-matrix-extended/commit/76aa25ffa77ee9838d8de77d97d9033a1ebbedf0)

## [v3.3.1] - 2024-06-04

- fix(cp): removed wrong dependency [`3883290`](https://github.com/vandres/craft-matrix-extended/commit/3883290a36fec0470c09c72e2b4626c3c09b25ec)

## [v3.3.0] - 2024-05-20

- fix(add): added build [`122a3ef`](https://github.com/vandres/craft-matrix-extended/commit/122a3ef1731c249f80bf190a52374facc556f49b)
- feat(add): respect `canAddMoreEntries` in much more places [`583dd66`](https://github.com/vandres/craft-matrix-extended/commit/583dd668d9586e4573339fd288f6ebed77feba86)
- fix(dragdrop): dragging class is not always removed [`cc8670f`](https://github.com/vandres/craft-matrix-extended/commit/cc8670fe707c05d3bd1e39b6c5670318be715a05)

## [v3.2.0] - 2024-05-20

- feat(setup): removed experimental for some of the features [`7c49247`](https://github.com/vandres/craft-matrix-extended/commit/7c492478385fc2da72761ee84c98eace2a73f4b6)
- chore(cleanup): remove unused variable [`d078127`](https://github.com/vandres/craft-matrix-extended/commit/d078127378af1811923ff9df4128e455866e5952)
- docs(roadmap): updated roadmap [`5a13265`](https://github.com/vandres/craft-matrix-extended/commit/5a13265194a6e56f0ab7a2445e87e6f6b9f6eb36)

## [v3.1.0] - 2024-05-17

- feat(delete): made delete button configurable [`c1dc22f`](https://github.com/vandres/craft-matrix-extended/commit/c1dc22fae934844049280236aaf158d5cf1016d2)

## [v3.0.1] - 2024-05-17

- fix(add): grouped blocks didn't insert at correct postion [`c07bacd`](https://github.com/vandres/craft-matrix-extended/commit/c07bacdfbc9a8a471b78429361f20c808602b27d)
- fix(setup): fixed missing commits in changelog [`33f270f`](https://github.com/vandres/craft-matrix-extended/commit/33f270fa19e675d61795d2f66ae1b417ffe48372)

## [v3.0.0] - 2024-05-16

- feat(setup): created frontend buildchain with Vite [`d4bdc66`](https://github.com/vandres/craft-matrix-extended/commit/d4bdc66e8093eebfecbe74840e444f4d77184235)
- feat(setup): simplified frontend buildchain [`c0422f7`](https://github.com/vandres/craft-matrix-extended/commit/c0422f7c9b899e5387bc6043dd71fbd5629c9cb1)
- feat(craft): added logic from latest Craft release [`b6e281d`](https://github.com/vandres/craft-matrix-extended/commit/b6e281d5ab5cc91f0afa11a14e7a0ddafbb3b662)
- feat(dragdrop): don't reset order [`6a0265f`](https://github.com/vandres/craft-matrix-extended/commit/6a0265f66291c4c0a0ffdbf19a437ad2f8250b64)
- fix(duplicate): fixed duplicating nested elements [`90a0d68`](https://github.com/vandres/craft-matrix-extended/commit/90a0d68c54645216cf89937b97a875af6c1d01bf)
- fix(duplicate): fixed duplicating nested elements [`ec42725`](https://github.com/vandres/craft-matrix-extended/commit/ec4272556545edc78fac06c5e76d98f19bb9d0db)

## [v2.3.0] - 2024-05-15

- feat(settings): show overriden config settings [`170226d`](https://github.com/vandres/craft-matrix-extended/commit/170226d5e2e6834037b136022dc85ff10568b664)
- fix(setup): fixed changelog [`cbb9315`](https://github.com/vandres/craft-matrix-extended/commit/cbb93150db6b274e22213deae5c281f08be7c3ce)
- fix(settings): fixed typo [`c845393`](https://github.com/vandres/craft-matrix-extended/commit/c8453932c28c93cb8005acd35f493815af9de8e9)
- docs(dragdrop): updated roadmap [`651532a`](https://github.com/vandres/craft-matrix-extended/commit/651532a45324127a17dff41f9c0f1f19f60b3502)

## [v2.2.0] - 2024-05-13

- feat(dragdrop): feature now fully working [`88403ea`](https://github.com/vandres/craft-matrix-extended/commit/88403ead8cc5d7eae41aa3cd81e50ce840aabadd)
- docs(changelog): updated to "Keep a Changelog" format [`03cc0bd`](https://github.com/vandres/craft-matrix-extended/commit/03cc0bd71c1deb4bddf8d85980010775a82f9cc5)
- docs(changelog): updated to "Keep a Changelog" format [`ef7c166`](https://github.com/vandres/craft-matrix-extended/commit/ef7c166fd8b7eb9b7a41ac97b7f3798b5732101f)
- Release 2.1.0 [`2feefdd`](https://github.com/vandres/craft-matrix-extended/commit/2feefddac530f90a256e1b288813b8197e5dc16c)

## [v2.1.0] - 2024-05-03

- docs(changelog): updated to "Keep a Changelog" format [`9c9f005`](https://github.com/vandres/craft-matrix-extended/commit/9c9f005b103a8a47e221ccfe90aedd6735165319)
- feat(dragdrop): first implementation of dragdrop [`0b1dba3`](https://github.com/vandres/craft-matrix-extended/commit/0b1dba31a5d5d06810c260cc34fd7d2e6ecad592)
- Release 2.1.0 [`b6db176`](https://github.com/vandres/craft-matrix-extended/commit/b6db1768e59a9d777b39f7e366a81b09f8a9fdb2)
- feat(dragdrop): added permission check [`d14a094`](https://github.com/vandres/craft-matrix-extended/commit/d14a094851c3761034458c18a1179b2891136b29)
- feat(dragdrop): hide feature behind setting [`9e0a26d`](https://github.com/vandres/craft-matrix-extended/commit/9e0a26d0f02ac2b3c482801e6c143e34b956a9be)
- fix(dragdrop): drag and drop field were always the same [`f55bc9d`](https://github.com/vandres/craft-matrix-extended/commit/f55bc9dc5795a6e8871a3fd1b25c2ef5f283e284)

## [v2.0.1] - 2024-05-02

- fix(add): nested fields didn't get grouped [`e059300`](https://github.com/vandres/craft-matrix-extended/commit/e05930050980133b2d52960cbaaab25ccb2e1007)

## [v2.0.0] - 2024-05-02

- feat(add): allow to group blocks [`f47c205`](https://github.com/vandres/craft-matrix-extended/commit/f47c205726b990cec5c953ab489ce185f3b2ceec)
- feat(add): allow to group also in default button [`3d6dd3b`](https://github.com/vandres/craft-matrix-extended/commit/3d6dd3b57849348d43a8a413a8294a4e93e3008e)
- feat(add): allow to group blocks [`3b0773d`](https://github.com/vandres/craft-matrix-extended/commit/3b0773d4bd4271dec825d32bdadf29b7a990cd50)

## [v1.5.1] - 2024-05-01

- docs(add): updated roadmap [`8af7774`](https://github.com/vandres/craft-matrix-extended/commit/8af7774140d7da01e7482539e4fc4df7956b8b56)
- fix(add): first button gets add icon [`1608af5`](https://github.com/vandres/craft-matrix-extended/commit/1608af54f57807b98284f6b1900debb34510c285)

## [v1.5.0] - 2024-05-01

- feat(add): allow to show menu as button group [`9743b37`](https://github.com/vandres/craft-matrix-extended/commit/9743b374d49bca3fcee6a77f22efbb6655323ed9)

## [v1.4.1] - 2024-05-01

- fix(changelog): fixed changelog [`4189e08`](https://github.com/vandres/craft-matrix-extended/commit/4189e088d5264b5f2121eb605976e53727b7ab46)

## [v1.4.0] - 2024-05-01

- feat(add): added experimental function "add block above" [`8601ccc`](https://github.com/vandres/craft-matrix-extended/commit/8601ccca0c1836834cdfda8e4c7aff6be46061da)
- docs(cut): changed roadmap [`ea8d817`](https://github.com/vandres/craft-matrix-extended/commit/ea8d81791fda0da23c40ac321ba2f51c5d391d3e)
- docs(funding): removed GitHub funding [`9ef982b`](https://github.com/vandres/craft-matrix-extended/commit/9ef982bc4150b9a72e112c1173c3dc09fdad4181)
- docs(cut): changed roadmap [`bf2a201`](https://github.com/vandres/craft-matrix-extended/commit/bf2a20196bc984a0ca0e215721f77927c9291dbb)

## [v1.3.0] - 2024-04-30

- feat(copy): added check field relations (which entry type is allowed where) [`e55041e`](https://github.com/vandres/craft-matrix-extended/commit/e55041e9c47e9516d945e39e51c90618d36825ac)

## [v1.2.0] - 2024-04-29

- feat(copy): hide experimental features behind a setting [`dbebeda`](https://github.com/vandres/craft-matrix-extended/commit/dbebeda887bfa601af47ccdf0d2b746c5bfe561f)

## [v1.1.1] - 2024-04-29

- docs(copy): updated readme [`3b1f1d6`](https://github.com/vandres/craft-matrix-extended/commit/3b1f1d66a6511b6d07846f2ce17349be91a429db)

## [v1.1.0] - 2024-04-29

- feat(copy): experimental implementation of the copy and paste functionality [`b8a41fd`](https://github.com/vandres/craft-matrix-extended/commit/b8a41fd81c003ba89e9daa7ccd055d7ee6e9c108)

## [v1.0.2] - 2024-04-29

- chore(backend): updated tooling [`3a44587`](https://github.com/vandres/craft-matrix-extended/commit/3a44587a85ed35cdb665d4d48249463992e26e35)

## v1.0.1 - 2024-04-29

- initial commit [`ca7df0a`](https://github.com/vandres/craft-matrix-extended/commit/ca7df0ae9a845bf43eb593645293190638533fd9)
- docs(plugin): updated readme [`01b3ba0`](https://github.com/vandres/craft-matrix-extended/commit/01b3ba090a7a79464cfb919a73480d8525e927fe)

[v5.1.0]: https://github.com/vandres/craft-matrix-extended/compare/v5.0.0...v5.1.0
[v5.0.0]: https://github.com/vandres/craft-matrix-extended/compare/v4.2.1...v5.0.0
[v4.2.1]: https://github.com/vandres/craft-matrix-extended/compare/v4.2.0...v4.2.1
[v4.2.0]: https://github.com/vandres/craft-matrix-extended/compare/v4.1.0...v4.2.0
[v4.1.0]: https://github.com/vandres/craft-matrix-extended/compare/v4.0.2...v4.1.0
[v4.0.2]: https://github.com/vandres/craft-matrix-extended/compare/v4.0.1...v4.0.2
[v4.0.1]: https://github.com/vandres/craft-matrix-extended/compare/v4.0.0...v4.0.1
[v4.0.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.6.4...v4.0.0
[v3.6.4]: https://github.com/vandres/craft-matrix-extended/compare/v3.6.3...v3.6.4
[v3.6.3]: https://github.com/vandres/craft-matrix-extended/compare/v3.6.2...v3.6.3
[v3.6.2]: https://github.com/vandres/craft-matrix-extended/compare/v3.6.1...v3.6.2
[v3.6.1]: https://github.com/vandres/craft-matrix-extended/compare/v3.6.0...v3.6.1
[v3.6.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.5.2...v3.6.0
[v3.5.2]: https://github.com/vandres/craft-matrix-extended/compare/v3.5.1...v3.5.2
[v3.5.1]: https://github.com/vandres/craft-matrix-extended/compare/v3.5.0...v3.5.1
[v3.5.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.4.3...v3.5.0
[v3.4.3]: https://github.com/vandres/craft-matrix-extended/compare/v3.4.2...v3.4.3
[v3.4.2]: https://github.com/vandres/craft-matrix-extended/compare/v3.4.1...v3.4.2
[v3.4.1]: https://github.com/vandres/craft-matrix-extended/compare/v3.4.0...v3.4.1
[v3.4.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.3.1...v3.4.0
[v3.3.1]: https://github.com/vandres/craft-matrix-extended/compare/v3.3.0...v3.3.1
[v3.3.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.2.0...v3.3.0
[v3.2.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.1.0...v3.2.0
[v3.1.0]: https://github.com/vandres/craft-matrix-extended/compare/v3.0.1...v3.1.0
[v3.0.1]: https://github.com/vandres/craft-matrix-extended/compare/v3.0.0...v3.0.1
[v3.0.0]: https://github.com/vandres/craft-matrix-extended/compare/v2.3.0...v3.0.0
[v2.3.0]: https://github.com/vandres/craft-matrix-extended/compare/v2.2.0...v2.3.0
[v2.2.0]: https://github.com/vandres/craft-matrix-extended/compare/v2.1.0...v2.2.0
[v2.1.0]: https://github.com/vandres/craft-matrix-extended/compare/v2.0.1...v2.1.0
[v2.0.1]: https://github.com/vandres/craft-matrix-extended/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.5.1...v2.0.0
[v1.5.1]: https://github.com/vandres/craft-matrix-extended/compare/v1.5.0...v1.5.1
[v1.5.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.4.1...v1.5.0
[v1.4.1]: https://github.com/vandres/craft-matrix-extended/compare/v1.4.0...v1.4.1
[v1.4.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.1.1...v1.2.0
[v1.1.1]: https://github.com/vandres/craft-matrix-extended/compare/v1.1.0...v1.1.1
[v1.1.0]: https://github.com/vandres/craft-matrix-extended/compare/v1.0.2...v1.1.0
[v1.0.2]: https://github.com/vandres/craft-matrix-extended/compare/v1.0.1...v1.0.2
