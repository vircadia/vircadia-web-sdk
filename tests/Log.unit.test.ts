//
//  DomainServer.unit.test.js
//
//  Created by Nshan G. on 30 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {Logger, LogLevel, ConsoleLoggerContext, StringLoggerContext} from "../src/domain/shared/Log";

describe("Logger - unit tests", () => {

    test("Console context", () => {

        const logger = new Logger(new ConsoleLoggerContext());

        const debug = jest.spyOn(console, "debug").mockImplementation(() => { /* no-op */ });
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
        const info = jest.spyOn(console, "info").mockImplementation(() => { /* no-op */ });
        const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });

        logger.debug("Console debug message");
        logger.default("Console log message");
        logger.info("Console info message");
        logger.warning("Console warning message");
        logger.error("Console error message");

        expect(debug).toBeCalledWith("Console debug message");
        expect(log).toBeCalledWith("Console log message");
        expect(info).toBeCalledWith("Console info message");
        expect(warn).toBeCalledWith("Console warning message");
        expect(error).toBeCalledWith("Console error message");

        debug.mockClear();
        log.mockClear();
        info.mockClear();
        warn.mockClear();
        error.mockClear();

        logger.debug("Console debug message", "Type 1");
        logger.default("Console log message", "Type 2");
        logger.info("Console info message", "Type 3");
        logger.warning("Console warning message", "Type 4");
        logger.error("Console error message", "Type 5");

        expect(debug).toBeCalledWith("[Type 1]", "Console debug message");
        expect(log).toBeCalledWith("[Type 2]", "Console log message");
        expect(info).toBeCalledWith("[Type 3]", "Console info message");
        expect(warn).toBeCalledWith("[Type 4]", "Console warning message");
        expect(error).toBeCalledWith("[Type 5]", "Console error message");

        debug.mockRestore();
        log.mockRestore();
        info.mockRestore();
        warn.mockRestore();
        error.mockRestore();

    });

    test("String context", () => {
        const context = new StringLoggerContext();
        const logger = new Logger(context);

        logger.debug("Debug message");
        logger.default("Default message");
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

        logger.debug("Debug message", "Type 1");
        logger.default("Default message", "Type 2");
        logger.info("Info message", "Type 3");
        logger.warning("Warning message", "Type 4");
        logger.error("Error message", "Type 5");

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
        const logger = new Logger(context);

        logger.filterLevels(level => level >= LogLevel.INFO);

        logger.debug("Debug message");
        logger.default("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[INFO] Info message\n"
            + "[WARNING] Warning message\n"
            + "[ERROR] Error message\n"
        );
        context.buffer = "";

        logger.filterLevels(level => level <= LogLevel.DEFAULT);

        logger.debug("Debug message");
        logger.default("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[DEBUG] Debug message\n"
            + "[DEFAULT] Default message\n"
        );
        context.buffer = "";

        logger.filterLevels(level => [LogLevel.DEBUG, LogLevel.ERROR].includes(level));

        logger.debug("Debug message");
        logger.default("Default message");
        logger.info("Info message");
        logger.warning("Warning message");
        logger.error("Error message");

        expect(context.buffer).toBe(""
            + "[DEBUG] Debug message\n"
            + "[ERROR] Error message\n"
        );

    });

    test("Filtering by type", () => {
        const context = new StringLoggerContext();
        const logger = new Logger(context);

        logger.setTypeFilter(["Type 2", "Type 4"]);

        logger.default("message");
        logger.default("message 1", "Type 1");
        logger.default("message 2", "Type 2");
        logger.default("message 3", "Type 3");
        logger.default("message 4", "Type 4");
        logger.default("message 5", "Type 5");

        expect(context.buffer).toBe(""
            + "[Type 2][DEFAULT] message 2\n"
            + "[Type 4][DEFAULT] message 4\n"
        );
        context.buffer = "";

        logger.setTypeFilter(["Type 1", "Type 3", undefined]);

        logger.default("message");
        logger.default("message 1", "Type 1");
        logger.default("message 2", "Type 2");
        logger.default("message 3", "Type 3");
        logger.default("message 4", "Type 4");
        logger.default("message 5", "Type 5");

        expect(context.buffer).toBe(""
            + "[DEFAULT] message\n"
            + "[Type 1][DEFAULT] message 1\n"
            + "[Type 3][DEFAULT] message 3\n"
        );
        context.buffer = "";

        logger.setTypeFilter([undefined]);

        logger.default("message");
        logger.default("message 1", "Type 1");
        logger.default("message 2", "Type 2");
        logger.default("message 3", "Type 3");
        logger.default("message 4", "Type 4");
        logger.default("message 5", "Type 5");

        expect(context.buffer).toBe(""
            + "[DEFAULT] message\n"
        );
        context.buffer = "";

        logger.setTypeFilter();

        logger.default("message");
        logger.default("message 1", "Type 1");
        logger.default("message 2", "Type 2");
        logger.default("message 3", "Type 3");
        logger.default("message 4", "Type 4");
        logger.default("message 5", "Type 5");

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
        const logger = new Logger(context);

        logger.filterLevels(level => level <= LogLevel.DEFAULT);
        logger.setTypeFilter(["Type 2"]);

        logger.default("message");
        logger.debug("Debug message 1", "Type 1");
        logger.default("Default message 2", "Type 2");
        logger.info("Info message 1", "Type 1");
        logger.warning("message 2", "Type 2");
        logger.error("message 1", "Type 1");

        expect(context.buffer).toBe(""
            + "[Type 2][DEFAULT] Default message 2\n"
        );
        context.buffer = "";
    });

    test("Logger.once", () => {
        const context = new StringLoggerContext();
        const logger = new Logger(context);

        logger.once(LogLevel.DEBUG, "message");
        logger.once(LogLevel.DEBUG, "message");
        logger.once(LogLevel.DEBUG, "message");

        logger.once(LogLevel.DEBUG, "message", "Type");
        logger.once(LogLevel.DEBUG, "message", "Type");
        logger.once(LogLevel.DEBUG, "message", "Type");

        logger.once(LogLevel.DEBUG, "message", "undefined");
        logger.once(LogLevel.DEBUG, "message", "undefined");
        logger.once(LogLevel.DEBUG, "message", "undefined");

        logger.once(LogLevel.INFO, "message");
        logger.once(LogLevel.INFO, "message");
        logger.once(LogLevel.INFO, "message");

        logger.once(LogLevel.DEBUG, "another message");
        logger.once(LogLevel.DEBUG, "another message");
        logger.once(LogLevel.DEBUG, "another message");

        expect(context.buffer).toBe(""
            + "[DEBUG] message\n"
            + "[Type][DEBUG] message\n"
            + "[undefined][DEBUG] message\n"
            + "[INFO] message\n"
            + "[DEBUG] another message\n"
        );
        context.buffer = "";
    });

});
