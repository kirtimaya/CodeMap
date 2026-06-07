import type { MCQQuestion, CodingQuestion, DifficultyLevel } from '../types';

export const SEED_MCQ: MCQQuestion[] = [
  {
    id: 'mcq-gc-1',
    conceptId: 'gc-heap-structure',
    type: 'mcq',
    level: 1,
    question: 'Where are new Java objects allocated in the heap?',
    options: ['Old Generation', 'Eden space', 'Survivor S0', 'Metaspace'],
    correctIndex: 1,
    explanation: 'New objects are allocated in the Eden space using fast bump-pointer allocation. They only move to Survivor spaces or Old Generation after surviving one or more minor GCs.',
  },
  {
    id: 'mcq-gc-2',
    conceptId: 'gc-heap-structure',
    type: 'mcq',
    level: 2,
    question: 'What happens when an object survives 15 minor GC cycles by default?',
    options: ['It is immediately collected', 'It is promoted to Old Generation', 'It moves to Metaspace', 'It is copied to a new Eden space'],
    correctIndex: 1,
    explanation: 'HotSpot JVM promotes objects to Old Generation when their age (number of GC cycles survived) exceeds the tenuring threshold, which defaults to 15. This is controlled by -XX:MaxTenuringThreshold.',
  },
  {
    id: 'mcq-gc-3',
    conceptId: 'gc-algorithms',
    type: 'mcq',
    level: 3,
    question: 'Which garbage collector is designed to achieve sub-millisecond pause times regardless of heap size?',
    options: ['G1 GC', 'Parallel GC', 'ZGC', 'Serial GC'],
    correctIndex: 2,
    explanation: 'ZGC (Z Garbage Collector) is designed for ultra-low latency, targeting sub-millisecond pause times even with heaps up to 16TB. It uses concurrent marking and compaction, meaning most work happens while the application runs.',
  },
  {
    id: 'mcq-thread-1',
    conceptId: 'thread-model',
    type: 'mcq',
    level: 1,
    question: 'A thread is waiting for a monitor lock held by another thread. What state is it in?',
    options: ['WAITING', 'TIMED_WAITING', 'BLOCKED', 'SUSPENDED'],
    correctIndex: 2,
    explanation: 'A thread waiting to acquire a monitor lock (via synchronized block/method) is in the BLOCKED state. WAITING is for indefinite waits via Object.wait() or Thread.join() without timeout.',
  },
  {
    id: 'mcq-thread-2',
    conceptId: 'virtual-threads',
    type: 'mcq',
    level: 2,
    question: 'What is "pinning" in the context of Java virtual threads?',
    options: [
      'Assigning a virtual thread to a specific CPU core',
      'A virtual thread being unable to unmount from its carrier thread during a blocking operation',
      'Storing thread-local variables in a fixed memory location',
      'Locking a virtual thread to prevent migration between JVMs',
    ],
    correctIndex: 1,
    explanation: 'Pinning occurs when a virtual thread cannot unmount from its carrier OS thread, typically when inside a synchronized block or native method (JNI). A pinned carrier thread is blocked, defeating virtual thread benefits for that call.',
  },
  {
    id: 'mcq-di-1',
    conceptId: 'dependency-injection',
    type: 'mcq',
    level: 1,
    question: 'Which form of Spring dependency injection is recommended as a best practice?',
    options: ['Field injection with @Autowired', 'Setter injection', 'Constructor injection', 'Method injection'],
    correctIndex: 2,
    explanation: 'Constructor injection is the recommended approach because it makes dependencies explicit, allows fields to be final (immutable), enables detection of circular dependencies at startup, and makes the class testable without a Spring container.',
  },
  {
    id: 'mcq-di-2',
    conceptId: 'dependency-injection',
    type: 'mcq',
    level: 3,
    question: 'A Spring @Service bean with singleton scope has a prototype-scoped dependency injected via constructor. What happens?',
    options: [
      'Spring throws an exception at startup',
      'The prototype bean is re-created on each call',
      'The singleton holds a single prototype instance created at startup — injection time',
      'Spring automatically creates a scoped proxy',
    ],
    correctIndex: 2,
    explanation: 'The prototype bean is injected once into the singleton at construction time. The singleton holds that single instance — you do NOT get a new prototype per call. Use ObjectProvider<T> or a @Lookup method to get fresh prototype instances when needed.',
  },
  {
    id: 'mcq-lifecycle-1',
    conceptId: 'bean-lifecycle',
    type: 'mcq',
    level: 2,
    question: 'At which lifecycle phase does Spring create AOP proxies for beans annotated with @Transactional?',
    options: [
      '@PostConstruct execution',
      'BeanPostProcessor.postProcessBeforeInitialization()',
      'BeanPostProcessor.postProcessAfterInitialization()',
      'During the bean instantiation phase',
    ],
    correctIndex: 2,
    explanation: 'AOP proxies are created in BeanPostProcessor.postProcessAfterInitialization() by the AnnotationAwareAspectJAutoProxyCreator. This is after @PostConstruct runs, which means @PostConstruct runs on the actual target object, not the proxy.',
  },
  {
    id: 'mcq-transaction-1',
    conceptId: 'transactions',
    type: 'mcq',
    level: 3,
    question: 'A @Transactional method calls another @Transactional method in the SAME class. What happens to the inner transaction?',
    options: [
      'A new transaction is created',
      'The call is not transactional — it bypasses the proxy',
      'Spring throws an IllegalStateException',
      'The inner method joins the outer transaction',
    ],
    correctIndex: 1,
    explanation: '@Transactional works via proxy. When a method calls another method on the same object (this.method()), it bypasses the proxy entirely — no transaction management occurs for the inner call. This is the infamous "self-invocation problem".',
  },
  {
    id: 'mcq-security-1',
    conceptId: 'security-filter-chain',
    type: 'mcq',
    level: 3,
    question: 'Which Spring Security filter translates AuthenticationException and AccessDeniedException into HTTP responses?',
    options: [
      'UsernamePasswordAuthenticationFilter',
      'SecurityContextPersistenceFilter',
      'ExceptionTranslationFilter',
      'FilterSecurityInterceptor',
    ],
    correctIndex: 2,
    explanation: 'ExceptionTranslationFilter catches security exceptions from downstream filters. AuthenticationException triggers the AuthenticationEntryPoint (typically 401). AccessDeniedException triggers AccessDeniedHandler (typically 403, or redirect to login for authenticated users).',
  },
  {
    id: 'mcq-map-1',
    conceptId: 'map-internals',
    type: 'mcq',
    level: 2,
    question: 'What is the default initial capacity and load factor of HashMap?',
    options: ['8 buckets, 0.8 load factor', '16 buckets, 0.75 load factor', '32 buckets, 0.5 load factor', '10 buckets, 1.0 load factor'],
    correctIndex: 1,
    explanation: 'HashMap defaults to 16 initial buckets and a 0.75 load factor. This means it resizes (doubles the array and rehashes all entries) when 12 entries (16 × 0.75) are reached. Pre-sizing with new HashMap<>(expectedSize / 0.75 + 1) prevents costly rehashing.',
  },
  {
    id: 'mcq-classloading-1',
    conceptId: 'jvm-classloading',
    type: 'mcq',
    level: 2,
    question: 'What is the class identity in the JVM?',
    options: [
      'The fully qualified class name',
      'The class name plus its package',
      'The class name plus the ClassLoader that loaded it',
      'The class file bytecode hash',
    ],
    correctIndex: 2,
    explanation: 'In the JVM, class identity is determined by the combination of the fully qualified class name AND the ClassLoader instance that loaded it. The same .class file loaded by two different ClassLoaders produces two distinct Class objects that cannot be cast to each other.',
  },
  {
    id: 'mcq-aop-1',
    conceptId: 'proxy-mechanism',
    type: 'mcq',
    level: 3,
    question: 'Why can CGLIB proxies not be created for final classes?',
    options: [
      'CGLIB does not support the reflection API for final classes',
      'CGLIB creates proxies by subclassing the target class, and Java prohibits subclassing final classes',
      'Final classes are loaded by the Bootstrap ClassLoader which CGLIB cannot access',
      'Spring explicitly blocks CGLIB proxy creation for final classes',
    ],
    correctIndex: 1,
    explanation: 'CGLIB creates a proxy by generating a subclass of the target class at runtime and overriding its methods with interceptor calls. Since Java\'s final keyword prevents subclassing, CGLIB cannot create proxies for final classes. This is why @Transactional and similar annotations fail on final beans.',
  },
];

export const SEED_CODING: CodingQuestion[] = [
  {
    id: 'code-thread-safe-counter',
    conceptId: 'synchronized-locks',
    type: 'coding',
    level: 2,
    prompt: `Implement a thread-safe counter class that supports:
1. increment() — adds 1 to the count
2. decrement() — subtracts 1 from the count
3. getCount() — returns the current count

The counter must be safe for concurrent access from multiple threads.
Implement it two ways:
- Using synchronized
- Using AtomicInteger`,
    starterCode: `import java.util.concurrent.atomic.AtomicInteger;

public class ThreadSafeCounter {
    // Approach 1: synchronized
    private int syncCount = 0;

    public synchronized void increment() {
        // TODO
    }

    public synchronized void decrement() {
        // TODO
    }

    public synchronized int getCount() {
        // TODO
    }

    // Approach 2: AtomicInteger
    private AtomicInteger atomicCount = new AtomicInteger(0);

    public void atomicIncrement() {
        // TODO
    }

    public void atomicDecrement() {
        // TODO
    }

    public int atomicGet() {
        // TODO
    }
}`,
    rubric: `Evaluate on:
1. Correctness: synchronized methods form a complete mutual exclusion boundary (5pts)
2. AtomicInteger usage: uses incrementAndGet()/decrementAndGet()/get() (5pts)
3. Memory visibility: synchronized/AtomicInteger both guarantee visibility (3pts)
4. Java idioms: no unnecessary synchronization on getCount beyond what's needed (2pts)`,
    hints: [
      'synchronized on an instance method locks on "this" — all three methods must synchronize on the same object',
      'AtomicInteger uses CAS (compare-and-swap) operations — no explicit locking needed',
      'getCount() also needs synchronization with the synchronized approach for memory visibility',
    ],
  },
  {
    id: 'code-custom-hashmap',
    conceptId: 'map-internals',
    type: 'coding',
    level: 3,
    prompt: `Implement a simplified HashMap that supports:
1. put(K key, V value) — store a key-value pair
2. get(K key) — retrieve value by key (return null if not found)
3. containsKey(K key) — check if key exists

Requirements:
- Use an array of linked lists (chaining) for collision handling
- Initial capacity of 16 buckets
- Correct use of hashCode() and equals()`,
    starterCode: `public class SimpleHashMap<K, V> {
    private static final int CAPACITY = 16;

    @SuppressWarnings("unchecked")
    private Node<K,V>[] buckets = new Node[CAPACITY];

    private static class Node<K, V> {
        final K key;
        V value;
        Node<K,V> next;

        Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }

    private int bucketIndex(K key) {
        // TODO: compute bucket index from key.hashCode()
        // Ensure non-negative index within [0, CAPACITY)
        return 0;
    }

    public void put(K key, V value) {
        // TODO
    }

    public V get(K key) {
        // TODO: return null if not found
        return null;
    }

    public boolean containsKey(K key) {
        // TODO
        return false;
    }
}`,
    rubric: `Evaluate on:
1. bucketIndex: handles null key, uses Math.abs or bitwise AND with (CAPACITY-1) to avoid negative indices (4pts)
2. put: correctly updates existing key, adds new node to chain (4pts)
3. get: traverses chain with equals(), handles not-found case (3pts)
4. equals/hashCode: uses key.equals() not == for comparison (4pts)`,
    hints: [
      'Use (key.hashCode() & 0x7fffffff) % CAPACITY to get a non-negative bucket index',
      'When iterating the chain in get(), use key.equals(node.key) not key == node.key',
      'In put(), check if the key already exists in the chain before adding a new node',
    ],
  },
  {
    id: 'code-completablefuture',
    conceptId: 'completablefuture',
    type: 'coding',
    level: 3,
    prompt: `Implement an async user profile loader that:
1. Fetches a user by ID asynchronously (simulate with Thread.sleep)
2. Enriches the user with their order count (another async call)
3. Returns a formatted String: "User: {name}, Orders: {count}"
4. If either step fails, return "Profile unavailable"

Use CompletableFuture.`,
    starterCode: `import java.util.concurrent.*;

public class UserProfileLoader {
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    // Simulate async DB call
    private CompletableFuture<String> fetchUser(int userId) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(100); } catch (InterruptedException e) { throw new RuntimeException(e); }
            if (userId <= 0) throw new RuntimeException("User not found");
            return "Alice";
        }, executor);
    }

    // Simulate async order count fetch
    private CompletableFuture<Integer> fetchOrderCount(String userName) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(80); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return 42;
        }, executor);
    }

    public CompletableFuture<String> loadProfile(int userId) {
        // TODO: Compose fetchUser and fetchOrderCount
        // On success: return "User: {name}, Orders: {count}"
        // On any failure: return "Profile unavailable"
        return CompletableFuture.completedFuture("TODO");
    }
}`,
    rubric: `Evaluate on:
1. thenCompose used correctly (not thenApply) to chain the two async operations (5pts)
2. exceptionally or handle used to recover from failures (4pts)
3. String formatting correct: "User: {name}, Orders: {count}" (2pts)
4. No blocking calls (get(), join()) in the pipeline (4pts)`,
    hints: [
      'Use thenCompose (not thenApply) when your transform function itself returns a CompletableFuture',
      'thenApply on a CompletableFuture<CompletableFuture<T>> gives you a nested future — thenCompose flattens it',
      'exceptionally(ex -> "Profile unavailable") catches any exception and replaces it with a fallback value',
    ],
  },
];

export function getQuestionsForConcept(conceptId: string, level: DifficultyLevel, type: 'mcq' | 'coding'): (MCQQuestion | CodingQuestion)[] {
  if (type === 'mcq') {
    const exact = SEED_MCQ.filter((q) => q.conceptId === conceptId && q.level === level);
    if (exact.length > 0) return exact;
    // Fall back to any level for this concept
    const any = SEED_MCQ.filter((q) => q.conceptId === conceptId);
    if (any.length > 0) return any;
    // Fall back to any question at this level
    return SEED_MCQ.filter((q) => q.level === level);
  } else {
    const exact = SEED_CODING.filter((q) => q.conceptId === conceptId && q.level === level);
    if (exact.length > 0) return exact;
    return SEED_CODING.slice(0, 1);
  }
}
