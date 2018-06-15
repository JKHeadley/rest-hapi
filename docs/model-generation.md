---
id: model-generation
title: Model Generation
sidebar_label: Model Generation
---

In some situations models may be required before or without endpoint generation. For example some hapi plugins may require models to exist before the routes are registered. In these cases rest-hapi provides a ``generateModels`` function that can be called independently.

> **NOTE:** See the [appy seed file](https://github.com/JKHeadley/appy/blob/master/gulp/seed.js) (or [scripts/seed.js](https://github.com/JKHeadley/rest-hapi/blob/master/scripts/seed.js)) for another example usage of ``generateModels``.

