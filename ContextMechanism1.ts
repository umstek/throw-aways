import assert from "node:assert";

function createContext<C>(defaultValue: C) {
	let currentContext = defaultValue;

	function useContext() {
		return currentContext;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	function applyContext<T, A extends any[]>(
		fn: (...args: A) => Promise<T> | T,
		context: Partial<C>,
	) {
		return async (...args: A) => {
			const previousContext = currentContext;
			currentContext = { ...currentContext, ...context };
			try {
				const result = await fn(...args);
				return result;
			} catch (error) {
				console.error("Error in function execution:", error);
				throw error;
			} finally {
				currentContext = previousContext;
			}
		};
	}

	return { useContext, applyContext };
}

const { useContext, applyContext } = createContext({ a: 0, s: "" });

async function root() {
	const context = { a: 1, s: "hello" };

	const func3WithContext = applyContext(func3, context);
	assert((await func3WithContext()) === "func3 result");

	const func1WithContext = applyContext(func1, context);
	assert((await func1WithContext(1)) === "func1 result 1");

	const func4WithContext = applyContext(func4, context);
	assert((await func4WithContext()) === "func4 result");

	const func2WithContext = applyContext(func2, context);
	assert((await func2WithContext()) === "func2 result");
}

function func1(k: number) {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	return `func1 result ${k}`;
}

function func2() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });
	assert(deepFuncIn2() === "deepFuncIn2 result");

	return "func2 result";
}

function deepFuncIn2() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });
	assert(deepFuncInDeepFuncIn2() === "deepFuncInDeepFuncIn2 result");

	return "deepFuncIn2 result";
}

function deepFuncInDeepFuncIn2() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });
	assert(
		deepFuncInDeepFuncInDeepFuncIn2() ===
			"deepFuncInDeepFuncInDeepFuncIn2 result",
	);

	return "deepFuncInDeepFuncIn2 result";
}

function deepFuncInDeepFuncInDeepFuncIn2() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	return "deepFuncInDeepFuncInDeepFuncIn2 result";
}

async function func3() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	const newContext = { a: 2, s: "world" };

	const deepFuncIn3WithContext = applyContext(deepFuncIn3, newContext);
	assert((await deepFuncIn3WithContext()) === "deepFuncIn3 result");

	return "func3 result";
}

function deepFuncIn3() {
	const context = useContext();

	assert.deepEqual(context, { a: 2, s: "world" });
	assert(deepFuncInDeepFuncIn3() === "deepFuncInDeepFuncIn3 result");

	return "deepFuncIn3 result";
}

function deepFuncInDeepFuncIn3() {
	const context = useContext();

	assert.deepEqual(context, { a: 2, s: "world" });

	return "deepFuncInDeepFuncIn3 result";
}

async function func4() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	const newContext = { a: 3, s: "foo" };

	const deepFuncIn4WithContext = applyContext(deepFuncIn4, newContext);
	assert((await deepFuncIn4WithContext()) === "deepFuncIn4 result");

	return "func4 result";
}

function deepFuncIn4() {
	const context = useContext();

	assert.deepEqual(context, { a: 3, s: "foo" });
	assert(deepFuncInDeepFuncIn4() === "deepFuncInDeepFuncIn4 result");

	return "deepFuncIn4 result";
}

function deepFuncInDeepFuncIn4() {
	const context = useContext();

	assert.deepEqual(context, { a: 3, s: "foo" });
	assert(
		deepFuncInDeepFuncInDeepFuncIn4() ===
			"deepFuncInDeepFuncInDeepFuncIn4 result",
	);

	return "deepFuncInDeepFuncIn4 result";
}

function deepFuncInDeepFuncInDeepFuncIn4() {
	const context = useContext();

	assert.deepEqual(context, { a: 3, s: "foo" });
	assert(
		deepFuncInDeepFuncInDeepFuncInDeepFuncIn4() ===
			"deepFuncInDeepFuncInDeepFuncInDeepFuncIn4 result",
	);

	return "deepFuncInDeepFuncInDeepFuncIn4 result";
}

function deepFuncInDeepFuncInDeepFuncInDeepFuncIn4() {
	const context = useContext();

	assert.deepEqual(context, { a: 3, s: "foo" });

	return "deepFuncInDeepFuncInDeepFuncInDeepFuncIn4 result";
}

root();
