---
id: misc
title: Miscellaneous
sidebar_label: Miscellaneous
---

## Model generation
In some situations models may be required before or without endpoint generation. For example some hapi plugins may require models to exist before the routes are registered. In these cases rest-hapi provides a ``generateModels`` function that can be called independently.

> **NOTE:** See the [appy seed file](https://github.com/JKHeadley/appy/blob/master/gulp/seed.js) (or [scripts/seed.js](https://github.com/JKHeadley/rest-hapi/blob/master/scripts/seed.js)) for another example usage of ``generateModels``.


## Testing
If you have downloaded the source you can run the tests with:
```
$ npm test
```


## License
MIT

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/rest-hapi/issues/new).  We'd love to hear from you!

## Support
Like this project? Please star it! 

## Projects
Building a project with rest-hapi? [Open a PR](https://github.com/JKHeadley/rest-hapi/blob/master/README.md) and list it here!

- [appy](https://github.com/JKHeadley/appy)
   * A ready-to-go user system built on rest-hapi.
- [rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo) 
   * A simple demo project implementing rest-hapi in a hapi server.

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md