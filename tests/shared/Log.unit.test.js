//
//  Log.unit.test.js
//
//  Created by Nshan G. on 30 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import Log, {
    Logger,
    LogLevel,
    ConsoleLoggerContext,
    StringLoggerContext,
    LoggerContextCombination,
    LogFilterContext,
    LogReportContext,
    DefaultLogConfiguration
} from "../../src/shared/Log";

describe("Logger - unit tests", () => {

    test("Console context", () => {

        const logger = new Logger({ context: new ConsoleLoggerContext() });

        const debug = jest.spyOn(console, "debug").mockImplementation(() => { /* no-op */ });
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
        const info = jest.spyOn(console, "info").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        logger.debug("Console debug message");
        logger.message("Console log message");
        logger.info("Console info message");
        logger.warning("Console warning message");
        logger.error("Console error message");

        expect(debug).toHaveBeenCalledWith("Console debug message");
        expect(log).toHaveBeenCalledWith("Console log message");
        expect(info).toHaveBeenCalledWith("Console info message");
        expect(warn).toHaveBeenCalledWith("Console warning message");
        expect(error).toHaveBeenCalledWith("Console error message");

        debug.mockClear();
        log.mockClear();
        info.mockClear();
        warn.mockClear();
        error.mockClear();

        logger.tag("Type 1").debug("Console debug message");
        logger.tag("Type 2").message("Console log message");
        logger.tag("Type 3").info("Console info message");
        logger.tag("Type 4").warning("Console warning message");
        logger.tag("Type 5").error("Console error message");

        expect(debug).toHaveBeenCalledWith("[Type 1]", "Console debug message");
        expect(log).toHaveBeenCalledWith("[Type 2]", "Console log message");
        expect(info).toHaveBeenCalledWith("[Type 3]", "Console info message");
        expect(warn).toHaveBeenCalledWith("[Type 4]", "Console warning message");
        expect(error).toHaveBeenCalledWith("[Type 5]", "Console error message");

        debug.mockRestore();
        log.mockRestore();
        info.mockRestore();
        warn.mockRestore();
        error.mockRestore();

    });

    test("String context", () => {
        const context = new StringLoggerContext();
        const logger = new Logger({ context });

        logger.debug("Debug message");
        logger.message("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[DEBUG] Debug message\n"
            + "[DEFAULT] Default message\n"
            + "[INFO] Info message\n"
            + "[WARNING] Warning message\n"
            + "[ERROR] Error message\n"
        );
        context.buffer = "";

        logger.tag("Type 1").debug("Debug message");
        logger.tag("Type 2").message("Default message");
        logger.tag("Type 3").info("Info message");
        logger.tag("Type 4").warning("Warning message");
        logger.tag("Type 5").error("Error message");

        expect(context.buffer).toBe(""
            + "[Type 1][DEBUG] Debug message\n"
            + "[Type 2][DEFAULT] Default message\n"
            + "[Type 3][INFO] Info message\n"
            + "[Type 4][WARNING] Warning message\n"
            + "[Type 5][ERROR] Error message\n"
        );
    });

    test("Filtering by level", () => {
        const context = new StringLoggerContext();
        const config = { context };
        const logger = new Logger(config);

        config.levelFilter = (level) => {
            return level >= LogLevel.INFO;
        };

        logger.debug("Debug message");
        logger.message("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[INFO] Info message\n"
            + "[WARNING] Warning message\n"
            + "[ERROR] Error message\n"
        );
        context.buffer = "";

        config.levelFilter = (level) => {
            return level <= LogLevel.DEFAULT;
        };

        logger.debug("Debug message");
        logger.message("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[DEBUG] Debug message\n"
            + "[DEFAULT] Default message\n"
        );
        context.buffer = "";

        config.levelFilter = (level) => {
            return [LogLevel.DEBUG, LogLevel.ERROR].includes(level);
        };

        logger.debug("Debug message");
        logger.message("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[DEBUG] Debug message\n"
            + "[ERROR] Error message\n"
        );

    });

    test("Filtering by tags", () => {
        const context = new StringLoggerContext();
        const config = { context };
        const logger = new Logger(config);

        config.tagFilter = ["Type 2", "Type 4"];

        logger.message("message");
        logger.tag("Type 1").message("message 1");
        logger.tag("Type 2").message("message 2");
        logger.tag("Type 3").message("message 3");
        logger.tag("Type 4").message("message 4");
        logger.tag("Type 5").message("message 5");

        expect(context.buffer).toBe(""
            + "[Type 2][DEFAULT] message 2\n"
            + "[Type 4][DEFAULT] message 4\n"
        );
        context.buffer = "";

        config.tagFilter = ["Type 1", "Type 3", undefined];

        logger.message("message");
        logger.tag("Type 1").message("message 1");
        logger.tag("Type 2").message("message 2");
        logger.tag("Type 3").message("message 3");
        logger.tag("Type 4").message("message 4");
        logger.tag("Type 5").message("message 5");

        expect(context.buffer).toBe(""
            + "[DEFAULT] message\n"
            + "[Type 1][DEFAULT] message 1\n"
            + "[Type 3][DEFAULT] message 3\n"
        );
        context.buffer = "";

        config.tagFilter = [undefined];

        logger.message("message");
        logger.tag("Type 1").message("message 1");
        logger.tag("Type 2").message("message 2");
        logger.tag("Type 3").message("message 3");
        logger.tag("Type 4").message("message 4");
        logger.tag("Type 5").message("message 5");

        expect(context.buffer).toBe(""
            + "[DEFAULT] message\n"
        );
        context.buffer = "";

        config.tagFilter = undefined;

        logger.message("message");
        logger.tag("Type 1").message("message 1");
        logger.tag("Type 2").message("message 2");
        logger.tag("Type 3").message("message 3");
        logger.tag("Type 4").message("message 4");
        logger.tag("Type 5").message("message 5");

        expect(context.buffer).toBe(""
            + "[DEFAULT] message\n"
            + "[Type 1][DEFAULT] message 1\n"
            + "[Type 2][DEFAULT] message 2\n"
            + "[Type 3][DEFAULT] message 3\n"
            + "[Type 4][DEFAULT] message 4\n"
            + "[Type 5][DEFAULT] message 5\n"
        );
        context.buffer = "";

    });

    test("Mixed filtering", () => {
        const context = new StringLoggerContext();
        const config = { context };
        const logger = new Logger(config);

        config.levelFilter = (level) => {
            return level <= LogLevel.DEFAULT;
        };
        config.tagFilter = ["Type 2"];

        logger.message("message");
        logger.tag("Type 1").debug("Debug message 1");
        logger.tag("Type 2").message("Default message 2");
        logger.tag("Type 3").info("Info message 1");
        logger.tag("Type 4").warning("message 2");
        logger.tag("Type 5").error("message 1");

        expect(context.buffer).toBe(""
            + "[Type 2][DEFAULT] Default message 2\n"
        );
        context.buffer = "";
    });

    test("Log a message only once", () => {
        const context = new StringLoggerContext();
        const config = { context };
        const logger = new Logger(config);

        logger.one.debug("message");
        logger.one.debug("message");
        logger.one.debug("message");

        logger.tag("Type").one.debug("message");
        logger.tag("Type").one.debug("message");
        logger.tag("Type").one.debug("message");

        logger.tag("undefined").one.debug("message");
        logger.tag("undefined").one.debug("message");
        logger.tag("undefined").one.debug("message");

        logger.one.info("message");
        logger.one.info("message");
        logger.one.info("message");

        logger.one.debug("another message");
        logger.one.debug("another message");
        logger.one.debug("another message");

        expect(context.buffer).toBe(""
            + "[DEBUG] message\n"
            + "[Type][DEBUG] message\n"
            + "[undefined][DEBUG] message\n"
            + "[INFO] message\n"
            + "[DEBUG] another message\n"
        );
        context.buffer = "";
    });

    test("Log a record", () => {
        const context = new StringLoggerContext();
        const logger = new Logger({ context });

        const big = BigInt("9999999999999999999999999999999999999999999999");

        logger.message("a record is:", {
            str: "str",
            sym: Symbol("sym"),
            num: 2,
            bnum: big,
            bool: true,
            und: undefined,
            nil: null
        });

        expect(context.buffer).toBe(""
            + "[DEFAULT] a record is: \n"
            + "  str: str\n"
            + "  sym: Symbol(sym)\n"
            + "  num: 2\n"
            + `  bnum: ${big.toLocaleString()}\n`
            + "  bool: true\n"
            + "  und: undefined\n"
            + "  nil: null\n"
            + "\n"
        );
        context.buffer = "";
    });

    test("Multiple tags", () => {
        const context = new StringLoggerContext();
        const config = { context };
        const logger = new Logger(config).tag("toplevel");

        logger.tag("one", "two").message("message");
        logger.tag("two", "three").message("message");
        logger.tag("four", "five").message("message");

        expect(context.buffer).toBe(""
            + "[toplevel][one][two][DEFAULT] message\n"
            + "[toplevel][two][three][DEFAULT] message\n"
            + "[toplevel][four][five][DEFAULT] message\n"
        );
        context.buffer = "";

        config.tagFilter = ["one"];

        logger.tag("one", "two").message("message");
        logger.tag("two", "three").message("message");
        logger.tag("four", "one").message("message");

        expect(context.buffer).toBe(""
            + "[toplevel][one][two][DEFAULT] message\n"
            + "[toplevel][four][one][DEFAULT] message\n"
        );

    });

    test("Contexts composition", () => {
        const context1 = new StringLoggerContext();
        const context2 = new StringLoggerContext();
        const filtered = new StringLoggerContext();
        const buglog = new StringLoggerContext();


        const logger = new Logger({
            context: new LoggerContextCombination(
                context1,
                context2,
                new LogFilterContext(filtered, (level: LogLevel) => {
                    return level === LogLevel.INFO;
                }),
                new LogReportContext(buglog, 3)
            )
        });

        logger.message("message 1");
        logger.message("message 2");
        logger.message("message 3");

        expect(context1.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
        );

        expect(context2.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
        );

        expect(filtered.buffer).toBe("");
        expect(buglog.buffer).toBe("");

        logger.info("message 4");
        logger.warning("minor");

        expect(context1.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
            + "[INFO] message 4\n"
            + "[WARNING] minor\n"
        );

        expect(context2.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
            + "[INFO] message 4\n"
            + "[WARNING] minor\n"
        );

        expect(filtered.buffer).toBe(""
            + "[INFO] message 4\n"
        );
        expect(buglog.buffer).toBe("");

        logger.error("fatal");

        expect(context1.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
            + "[INFO] message 4\n"
            + "[WARNING] minor\n"
            + "[ERROR] fatal\n"
        );

        expect(context2.buffer).toBe(""
            + "[DEFAULT] message 1\n"
            + "[DEFAULT] message 2\n"
            + "[DEFAULT] message 3\n"
            + "[INFO] message 4\n"
            + "[WARNING] minor\n"
            + "[ERROR] fatal\n"
        );

        expect(filtered.buffer).toBe(""
            + "[INFO] message 4\n"
        );

        expect(buglog.buffer).toBe(""
            + "[INFO] message 4\n"
            + "[WARNING] minor\n"
            + "[ERROR] fatal\n"
        );

        context1.buffer = "";

    });

    test("Default behavior and configuration of the main SDK Logger instance", () => {

        const debug = jest.spyOn(console, "debug").mockImplementation(() => { /* no-op */ });
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
        const info = jest.spyOn(console, "info").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        Log.debug("Console debug message");
        Log.message("Console log message");
        Log.info("Console info message");
        Log.warning("Console warning message");
        Log.error("Console error message");

        expect(warn).toHaveBeenCalledWith("[vircadia-sdk]", "Console warning message");
        expect(error).toHaveBeenCalledWith("[vircadia-sdk]", "Console error message");

        debug.mockClear();
        log.mockClear();
        info.mockClear();
        warn.mockClear();
        error.mockClear();

        Log.tag("Type 1").debug("Console debug message");
        Log.tag("Type 2").message("Console log message");
        Log.tag("Type 3").info("Console info message");
        Log.tag("Type 4").warning("Console warning message");
        Log.tag("Type 5").error("Console error message");

        expect(warn).toHaveBeenCalledWith("[vircadia-sdk][Type 4]", "Console warning message");
        expect(error).toHaveBeenCalledWith("[vircadia-sdk][Type 5]", "Console error message");

        debug.mockClear();
        log.mockClear();
        info.mockClear();
        warn.mockClear();
        error.mockClear();

        DefaultLogConfiguration.filter = undefined;

        Log.debug("Console debug message");
        Log.message("Console log message");
        Log.info("Console info message");
        Log.warning("Console warning message");
        Log.error("Console error message");

        expect(debug).toHaveBeenCalledWith("[vircadia-sdk]", "Console debug message");
        expect(log).toHaveBeenCalledWith("[vircadia-sdk]", "Console log message");
        expect(info).toHaveBeenCalledWith("[vircadia-sdk]", "Console info message");
        expect(warn).toHaveBeenCalledWith("[vircadia-sdk]", "Console warning message");
        expect(error).toHaveBeenCalledWith("[vircadia-sdk]", "Console error message");

        debug.mockClear();
        log.mockClear();
        info.mockClear();
        warn.mockClear();
        error.mockClear();

        Log.tag("Type 1").debug("Console debug message");
        Log.tag("Type 2").message("Console log message");
        Log.tag("Type 3").info("Console info message");
        Log.tag("Type 4").warning("Console warning message");
        Log.tag("Type 5").error("Console error message");

        expect(debug).toHaveBeenCalledWith("[vircadia-sdk][Type 1]", "Console debug message");
        expect(log).toHaveBeenCalledWith("[vircadia-sdk][Type 2]", "Console log message");
        expect(info).toHaveBeenCalledWith("[vircadia-sdk][Type 3]", "Console info message");
        expect(warn).toHaveBeenCalledWith("[vircadia-sdk][Type 4]", "Console warning message");
        expect(error).toHaveBeenCalledWith("[vircadia-sdk][Type 5]", "Console error message");

        debug.mockRestore();
        log.mockRestore();
        info.mockRestore();
        warn.mockRestore();
        error.mockRestore();

        DefaultLogConfiguration.context = new StringLoggerContext();

        Log.tag("Type 1").debug("String debug message");
        Log.tag("Type 2").message("String log message");
        Log.tag("Type 3").info("String info message");
        Log.tag("Type 4").warning("String warning message");
        Log.tag("Type 5").error("String error message");

        expect(DefaultLogConfiguration.context.buffer).toBe(""
            + "[vircadia-sdk][Type 1][DEBUG] String debug message\n"
            + "[vircadia-sdk][Type 2][DEFAULT] String log message\n"
            + "[vircadia-sdk][Type 3][INFO] String info message\n"
            + "[vircadia-sdk][Type 4][WARNING] String warning message\n"
            + "[vircadia-sdk][Type 5][ERROR] String error message\n"
        );

    });

});
