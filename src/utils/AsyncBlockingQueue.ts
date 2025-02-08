export class AsyncBlockingQueue<T> implements AsyncIterable<T> {

    private promises: Promise<T>[] = [];
    private resolvers: ((value: T) => void)[] = [];

    get length(): number {
        return this.promises.length - this.resolvers.length;
    }

    enqueue(element: T) {
        if (!this.isBlocked()) this.add();
        this.resolvers.shift()!(element);
    }

    dequeue(): Promise<T> {
        if (this.isEmpty()) this.add();
        return this.promises.shift()!;
    }

    isEmpty(): boolean {
        return this.promises.length === 0;
    }

    isBlocked(): boolean {
        return this.resolvers.length > 0;
    }

    private add() {
        this.promises.push(new Promise(resolve => {
            this.resolvers.push(resolve);
        }));
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return {
            next: async (): Promise<IteratorResult<T>> => {
                const element = await this.dequeue();
                return {
                    done: false,
                    value: element,
                }
            },
        };
    }
}
