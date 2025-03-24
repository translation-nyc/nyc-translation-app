import {describe, expect, test} from "vitest";
import {AsyncBlockingQueue} from "../src/utils/async-blocking-queue";

describe.concurrent("AsyncBlockingQueue", () => {
    test("Can add item", async () => {
        const queue = new AsyncBlockingQueue<number>();

        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);

        queue.enqueue(1);

        expect(queue.length).toBe(1);
        expect(queue.isEmpty()).toBe(false);

        const element = await queue.dequeue();

        expect(element).toBe(1);
        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    test("Can add multiple items", async () => {
        const queue = new AsyncBlockingQueue<number>();

        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        expect(queue.length).toBe(3);
        expect(queue.isEmpty()).toBe(false);

        const element1 = await queue.dequeue();
        const element2 = await queue.dequeue();
        const element3 = await queue.dequeue();

        expect(element1).toBe(1);
        expect(element2).toBe(2);
        expect(element3).toBe(3);
        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });

    test("Can add and remove items", async () => {
        const queue = new AsyncBlockingQueue<number>();

        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);

        queue.enqueue(1);
        queue.enqueue(2);

        expect(queue.length).toBe(2);
        expect(queue.isEmpty()).toBe(false);

        const element1 = await queue.dequeue();

        expect(element1).toBe(1);
        expect(queue.length).toBe(1);
        expect(queue.isEmpty()).toBe(false);

        queue.enqueue(3);

        expect(queue.length).toBe(2);
        expect(queue.isEmpty()).toBe(false);

        const element2 = await queue.dequeue();
        const element3 = await queue.dequeue();

        expect(element2).toBe(2);
        expect(element3).toBe(3);
        expect(queue.length).toBe(0);
        expect(queue.isEmpty()).toBe(true);
    });
});
