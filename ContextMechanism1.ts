import assert from "node:assert";

function createContext<C>(defaultValue: C) {
	let currentContext = defaultValue;

	function Provider<T>(newContext: Partial<C>, callback: () => T) {
		const previousContext = currentContext;
		currentContext = { ...currentContext, ...newContext };
		const result = callback();
		currentContext = previousContext;
		return result;
	}

	function useContext() {
		return currentContext;
	}

	return { Provider, useContext };
}

const { Provider, useContext } = createContext({ a: 0, s: "" });

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function withContext<C, T, A extends any[]>(
	fn: (...args: A) => T,
	context: Partial<C>,
) {
	return (...args: A) => Provider(context, () => fn(...args));
}

function root() {
	const context = { a: 1, s: "hello" };

	const func3WithContext = withContext(func3, context);
	assert(func3WithContext() === "func3 result");

	const func1WithContext = withContext(func1, context);
	assert(func1WithContext(1) === "func1 result 1");

	const func4WithContext = withContext(func4, context);
	assert(func4WithContext() === "func4 result");

	const func2WithContext = withContext(func2, context);
	assert(func2WithContext() === "func2 result");
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

	return "deepFuncInDeepFuncIn2 result";
}

function func3() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	const newContext = { a: 2, s: "world" };

	const deepFuncIn3WithContext = withContext(deepFuncIn3, newContext);
	assert(deepFuncIn3WithContext() === "deepFuncIn3 result");

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

function func4() {
	const context = useContext();

	assert.deepEqual(context, { a: 1, s: "hello" });

	const newContext = { a: 3, s: "foo" };

	const deepFuncIn4WithContext = withContext(deepFuncIn4, newContext);
	assert(deepFuncIn4WithContext() === "deepFuncIn4 result");

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