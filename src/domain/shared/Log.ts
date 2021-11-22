//
//  Log.ts
//
//  Created by Nshan G. on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The levels of the <code>Logger</code> class.
 *  @enum {number}
 *  @property {number} DEBUG
 *  @property {number} DEFAULT
 *  @property {number} INFO
 *  @property {number} WARNING
 *  @property {number} ERROR
 */
enum LogLevel {
    DEBUG,
    DEFAULT,
    INFO,
    WARNING,
    ERROR
}

/*@devdoc
 *  An array containing all values of <Code>LogLevel</code> enum in ascending order.
 *  @type {Array<LogLevel>}
 */
const AllLogLevels = [
    LogLevel.DEBUG,
    LogLevel.DEFAULT,
    LogLevel.INFO,
    LogLevel.WARNING,
    LogLevel.ERROR
] as const;

/*@devdoc
 *  @typedef {string | symbol | number | bigint | boolean | undefined | null} LoggablePrimitive
 */
type LoggablePrimitive = string | symbol | number | bigint | boolean | undefined | null;

/*@devdoc
 *  @typedef {LoggablePrimitive | Record<string, LoggablePrimitive>} LoggableRecord
 */
type LoggableRecord = LoggablePrimitive | Record<string, LoggablePrimitive>;

/*@devdoc
 *  Implementing this interface will allow passing the objects of the class to the {@linkcode Logger}
 *  @interface Loggable
 */
interface Loggable {
    /*@devdoc
     *  Converts the object to a loggable representation
     *  @return {LoggableRecord} - a representation of the object based on loggable primitives
     */
    toLoggable(): LoggableRecord;
}

/*@devdoc
 *  @typedef {LoggablePrimitive | Loggable} LoggableObject
 */
type LoggableObject = LoggablePrimitive | Loggable;

/*@devdoc
 *  @typedef {LoggablePrimitive | Loggable} LoggableObjectRecord
 */
type LoggableObjectRecord = LoggableObject | Record<string, LoggableObject>;

/*@devdoc
 *  A predicate for filtering log messages
 *  @callback LogMessagePredicate
 *  @param {LogLevel} level - The logging level of the message.
 *  @param {Set<string>} tags - The tags associated with the message.
 *  @return {...LoggableRecord} loggables - the objects that comprise the message body
 *  @return {boolean} - Whether to include/allow the message.
 */
type LogMessagePredicate = (level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]) => boolean;

/*@devdoc
 *  Predicate function for filtering log messages based on log level.
 *  @callback LogLevelPredicate
 *  @param {LogLevel} level - The level in question.
 *  @return {boolean} Whether to show messages of the specified level.
 */

/*@devdoc
 *  The <code>LoggerContext</code> is an interface used in {@linkcode LoggerConfiguration}
 *  to specify the output of the {@linkcode Logger} class.
 *  @interface LoggerContext
 */
interface LoggerContext {
    /*@devdoc
     *  Outputs the log message.
     *  @function
     *  @name LoggerContext#log
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void;
}

/*@devdoc
 *  The <code>LoggerConfiguration</code> is an interface for configuration of the {@linkcode Logger} class.
 *  @interface LoggerConfiguration
 */
type LoggerConfiguration = {

    /*@devdoc
     *  A full message filter that is applied to log input, before it is passed to the context.
     *  @type {LogMessagePredicate}
     *  @name [LoggerConfiguration#filter]
     */
    filter?: LogMessagePredicate;


    /*@devdoc
     *  A level filter that is applied to log input, before the {@linkcode LoggerConfiguration#filter}
     *  @type {LogLevelPredicate}
     *  @name [LoggerConfiguration#levelFilter]
     */
    levelFilter?: (level: LogLevel) => boolean;


    /*@devdoc
     *  A log message tag specific filter that is applied to log input, before the {@linkcode LoggerConfiguration#filter}
     *  A given message will be included if it has any of the specified tags.
     *  <code>undefined</code> value in the array specifies to include messages without any tags.
     *  @type {Array<string | undefined>}
     *  @name [LoggerConfiguration#tagFilter]
     */
    tagFilter?: Array<string | undefined>;

    /*@devdoc
     *  The context that specifies the logger output.
     *  @type {LoggerContext}
     *  @name LoggerConfiguration#context
     */
    context: LoggerContext;

};

function loggablePrimitiveToString(loggable: LoggablePrimitive): string | undefined {
    if (loggable === null) {
        // NOTE: eslint disallows both
        // "" + loggable
        // and
        // `${loggable}`
        // I'm out of ideas, also for the undefined case below
        return "null";
    }

    switch (typeof loggable) {
        case "string":
            return loggable;

        case "number":
        case "boolean":
        case "symbol":
            return loggable.toLocaleString();

        case "bigint":
            return BigInt(loggable).toLocaleString();

        case "undefined":
            return "undefined";

        default:
            return undefined;
    }
}

function loggableRecordToString(loggable: Record<string, LoggablePrimitive>): string {
    let str = "\n";
    for (const [key, value] of Object.entries(loggable)) {
        str += `  ${key}: ${loggablePrimitiveToString(value) as string}\n`;
    }
    return str;
}

function loggableToString(loggable: LoggableRecord) {
    return loggablePrimitiveToString(loggable as LoggablePrimitive)
        || loggableRecordToString(loggable as Record<string, LoggablePrimitive>);
}

/*@devdoc
 *  The <code>ConsoleLoggerContext</code> is a logger output configuration for logging to the dev console.
 *
 *  @class ConsoleLoggerContext
 *  @implements LoggerContext
 */
class ConsoleLoggerContext implements LoggerContext {
    /* eslint-disable class-methods-use-this */
    /*@devdoc
     *  Outputs the log to the developer console.
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void {
        const logFunction = [console.debug, console.log, console.info, console.warn, console.error].at(level);
        if (logFunction) {
            if (tags.size === 0) {
                logFunction(...loggables);
            } else {
                logFunction(`[${[...tags].join("][")}]`, ...loggables);
            }
        }
    }
    /* eslint-enable class-methods-use-this */
}

/*@devdoc
 *  The <code>StringLoggerContext</code> is a output configuration for logging to a string.
 *
 *  @class StringLoggerContext
 *  @implements LoggerContext
 *  @property {string} buffer - The buffer to which all the log messages will be written.
 */
class StringLoggerContext implements LoggerContext {

    buffer = "";

    /*@devdoc
     *  Outputs the log to the string buffer.
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void {
        if (tags.size !== 0) {
            this.buffer += `[${[...tags].join("][")}]`;
        }
        this.buffer += `[${LogLevel[level] as string}]`;
        this.buffer += ` ${loggables.map(loggableToString).join(" ")}\n`;
    }

}

/*@devdoc
 *  The <code>LogFilterContext</code> is a logger context wrapper for filtering messages.
 *
 *  @class LogFilterContext
 *  @implements LoggerContext
 *  @param {LoggerContext} context - The buffer to forward the filtered logs to.
 *  @param {LogMessagePredicate} filter - The filter to apply to the messages.
 */
class LogFilterContext implements LoggerContext {

    #_context: LoggerContext;
    #_filter: LogMessagePredicate;

    constructor(context: LoggerContext, filter: LogMessagePredicate) {
        this.#_context = context;
        this.#_filter = filter;
    }

    /*@devdoc
     *  Passes logs that satisfy the specified filter to the specified context.
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void {
        if (this.#_filter(level, tags, ...loggables)) {
            this.#_context.log(level, tags, ...loggables);
        }
    }
}

/*@devdoc
 *  The <code>LoggerContextCombination</code> combines several logger contexts into one.
 *
 *  @class LoggerContextCombination
 *  @implements LoggerContext
 *  @param {...LoggerContext} contexts - The contexts to combine.
 */
class LoggerContextCombination implements LoggerContext {

    #_contexts: LoggerContext[];

    constructor(...contexts: LoggerContext[]) {
        this.#_contexts = contexts;
    }

    /*@devdoc
     *  Passes log message to all specified contexts.
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void {
        for (const context of this.#_contexts) {
            context.log(level, tags, ...loggables);
        }
    }
}

/*@devdoc
 *  The <code>LogReportContext</code> buffers log messages and passes them to specified context
 *  when a message is logged at the <code>ERROR</code> level or above.
 *
 *  @class LogReportContext
 *  @implements LoggerContext
 *  @param {LoggerContext} context - The contexts to pass the messages to.
 *  @param {number} [logCount] - The number of log messages to buffer.
 *  If unspecified all messages will be buffered.
 */
class LogReportContext implements LoggerContext {

    #_context: LoggerContext;
    #_logCount?: number;
    #_report: Array<[LogLevel, Set<string>, LoggableRecord[]]> = [];

    constructor(context: LoggerContext, logCount?: number) {
        this.#_context = context;
        this.#_logCount = logCount;
    }

    /*@devdoc
     *  Buffers the logs and passes them to the specified context.
     *  @param {LogLevel} level - The level to log the message at.
     *  @param {Set<string>} tags - The tags associated with the message.
     *  @param {LoggableObject[]} loggables - (@linkcode LoggableObject) list that comprises the message body.
     */
    log(level: LogLevel, tags: Set<string>, ...loggables: LoggableRecord[]): void {

        this.#_report.push([level, tags, loggables]);

        if (this.#_logCount && this.#_report.length > this.#_logCount) {
            this.#_report.shift();
        }

        if (level >= LogLevel.ERROR) {
            for (const log of this.#_report) {
                this.#_context.log(log[0], log[1], ...log[2]);
            }
            this.#_report.length = 0;
        }
    }
}

/*@devdoc
 *  The <code>Logger</code> class serves as a convenience utility and a centralized configuration point for logging.
 *
 *  @class Logger
 *  @param {LoggerConfiguration} configuration - The configuration this instance will use for output and filtering.
 *  @property {number} DEBUG - Alias for <code>LogLevel.DEBUG</code>.
 *  @property {number} DEFAULT - Alias for <code>LogLevel.DEFAULT</code>.
 *  @property {number} INFO - Alias for <code>LogLevel.INFO</code>.
 *  @property {number} WARNING - Alias for <code>LogLevel.WARNING</code>.
 *  @property {number} ERROR - Alias for <code>LogLevel.ERROR</code>.
 *  @property {Logger} one - Equivalent to calling {@linkcode Logger#once} with <code>true</code>
 */
class Logger {

    readonly DEBUG = LogLevel.DEBUG;
    readonly DEFAULT = LogLevel.DEFAULT;
    readonly INFO = LogLevel.INFO;
    readonly WARNING = LogLevel.WARNING;
    readonly ERROR = LogLevel.ERROR;

    #_configuration: LoggerConfiguration;
    #_tags = new Set<string>();
    #_tagsKey = "";
    #_once = false;
    #_messageFlags = new Map<string, boolean>();

    constructor(configuration: LoggerConfiguration) {
        this.#_configuration = configuration;
        this.#_updateTagsKey();
    }

    /*@devdoc
     *  Copy this logger instance adding specified tags.
     *  @param {...string} tags - The tags to add to the new logger instance.
     *  @return {Logger} - A new logger instance with specified tags added.
     */
    tag(...tags: string[]): Logger {
        const tagged = new Logger(this.#_configuration);
        tagged.#_tags = new Set([...this.#_tags, ...tags]);
        tagged.#_updateTagsKey();
        tagged.#_once = this.#_once;
        tagged.#_messageFlags = this.#_messageFlags;
        return tagged;
    }

    /*@devdoc
     *  Copy this logger instance specifying whether to eliminate duplicate logs or not.
     *  @param {boolean} enabled - true - prevent duplicates, false - allow duplicates.
     *  @return {Logger} - A new logger instance with specified behavior.
     */
    once(enabled: boolean): Logger {
        const onced = new Logger(this.#_configuration);
        onced.#_tags = this.#_tags;
        onced.#_tagsKey = this.#_tagsKey;
        onced.#_once = enabled;
        onced.#_messageFlags = this.#_messageFlags;
        return onced;
    }

    get one(): Logger {
        return this.once(true);
    }

    /*@devdoc
     *  Logs a message at the specified level.
     *  @param {LogLevel} level - The level to log at.
     *  @param {...LoggableObjectRecord} loggableObjects - The objects that comprise the message body.
     */
    level(level: LogLevel, ...loggableObjects: LoggableObjectRecord[]): void {
        const loggables = loggableObjects.map((obj) => {
            const loggable = obj as Loggable;
            if (loggable && loggable.toLoggable) {
                return loggable.toLoggable();
            }
            return obj as LoggableRecord;
        });

        if (this.#_once) {

            const id = `${this.#_tagsKey} | ${level} | ${loggables.map(loggableToString).join(" | ")}`;

            if (!this.#_messageFlags.get(id)) {
                this.#_messageFlags.set(id, true);
            } else {
                return;
            }
        }

        const levelFilter = this.#_configuration.levelFilter;
        const tagFilter = this.#_configuration.tagFilter;
        const filter = this.#_configuration.filter;
        if ((!levelFilter || levelFilter(level))
            && (!tagFilter || tagFilter.filter((tag) => {
                return tag === undefined && this.#_tags.size === 0
                    || this.#_tags.has(tag as string);
            }).length > 0)
            && (!filter || filter(level, this.#_tags, ...loggables))) {
            this.#_configuration.context.log(level, this.#_tags, ...loggables);
        }
    }

    /*@devdoc
     *  Logs a message at the default level.
     *  @param {...LoggableObjectRecord} loggables - The objects that comprise the message body.
     */
    message(...loggables: LoggableObjectRecord[]): void {
        this.level(LogLevel.DEFAULT, ...loggables);
    }

    /*@devdoc
     *  Logs a message at the info level.
     *  @param {...LoggableObjectRecord} loggables - The objects that comprise the message body.
     */
    info(...loggables: LoggableObjectRecord[]): void {
        this.level(LogLevel.INFO, ...loggables);
    }

    /*@devdoc
     *  Logs a message at the debug level.
     *  @param {...LoggableObjectRecord} loggables - The objects that comprise the message body.
     */
    debug(...loggables: LoggableObjectRecord[]): void {
        this.level(LogLevel.DEBUG, ...loggables);
    }

    /*@devdoc
     *  Logs a message at the warning level.
     *  @param {...LoggableObjectRecord} loggables - The objects that comprise the message body.
     */
    warning(...loggables: LoggableObjectRecord[]): void {
        this.level(LogLevel.WARNING, ...loggables);
    }

    /*@devdoc
     *  Logs a message at the error level.
     *  @param {...LoggableObjectRecord} loggables - The objects that comprise the message body.
     */
    error(...loggables: LoggableObjectRecord[]): void {
        this.level(LogLevel.ERROR, ...loggables);
    }

    #_updateTagsKey(): void {
        const tagSizes = [...this.#_tags].map((tag) => {
            return tag.length;
        }).join(",");
        const tagsString = [...this.#_tags].join();
        this.#_tagsKey = `${tagSizes} | ${tagsString}`;
    }

}

/*@sdkdoc
 *  The <code>DefaultLogConfiguration</code> is the main {@linkcode LoggerConfiguration} object used by the SDK.
 *
 *  @namespace DefaultLogConfiguration
 *  @property {LoggerContext} context - The context that specifies the output destination for the logs.
 *  @property {LogMessagePredicate} [filter] - A full message filter that is applied to log input,
 *  before it is passed to the context.
 *  @property {LogLevelPredicate} [levelFilter] - A level filter that is applied to log input,
 *  before the {@linkcode DefaultLogConfiguration#filter}
 *  @property {Array<string | undefined>} [tagFilter] - A log message tag specific filter that is applied to log input,
 *  before the {@linkcode DefaultLogConfiguration#filter}.
 *  A given message will be included if it has any of the specified tags.
 *  <code>undefined</code> value in the array specifies to include messages without any tags.
 */
const DefaultLogConfiguration = {
    context: new ConsoleLoggerContext(),
    levelFilter: (level: LogLevel) => {
        return level >= LogLevel.WARNING;
    }
} as LoggerConfiguration;

/*@devdoc
 *  The <code>Log</code> is the main {@linkcode Logger} instance used in the SDK.
 *  @type {Logger}
 */
const Log = new Logger(DefaultLogConfiguration).tag("vircadia-sdk");

export default Log;
export {
    LogLevel,
    AllLogLevels,
    Loggable,
    LoggerContext,
    LoggerConfiguration,
    ConsoleLoggerContext,
    StringLoggerContext,
    LogFilterContext,
    LoggerContextCombination,
    LogReportContext,
    Logger,
    DefaultLogConfiguration
};
