export interface MessageProducerBroker {
    connect: ()=> Promise<void>;
    disconnect:()=> Promise<void>
    sendMessgae: (topic:string, message: string) => Promise<void>
}
