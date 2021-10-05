"use strict";

/**
 * Folder creator to add missing folders according to .json config.
 * @constructor
 * 
 * @param path {string} Config name with extension.
 */
function FolderCreator(path, logger) {
  this.__logger = logger === undefined ? new ConsoleLogger() : logger;

  let validator = new Validator(path, logger);
  if (!validator.IsValid())
    throw new Error(`Config is incorrect. Possible reasons:
- key value is not "*" or object
- https://assertible.com/json endpoint is unavailable
- internal error`);

  /**
   * .json config content.
   */
  this.config = validator.config;
}

/**
 * Creates missing folders according to .json config.
 */
FolderCreator.prototype.CreateMissingFolders = function () {
  function create(where, parsed) {
    for (const key in parsed) {
      let iterator = where.getFoldersByName(key);
      if (!iterator.hasNext()) {
        this.__logger.writeInfo(`"${key}" folder created in "${where.getName()}".`);
        where.createFolder(key);
      }
      else if (!iterator.next().isTrashed())
        this.__logger.writeWarn(`Multiple "${key}" folders found in "${where.getName()}", "${key}" folder hasn't created in "${where.getName()}". Script execution results may be unpredictable.`);
    }

    for (const key in parsed) {
      const value = parsed[key];
      if (typeof value === "object") {
        let iterator = where.getFoldersByName(key);
        create.call(this, iterator.next(), value);
      }
    }
  }

  const root = DriveApp.getRootFolder();
  return create.call(this, root, JSON.parse(this.config))
}

Object.freeze(FolderCreator);
