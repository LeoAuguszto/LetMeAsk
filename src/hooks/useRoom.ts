import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type QuestionType = {
    id: string;
    author:{
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likeId: string | undefined;
    likeCount: number;
    

}
type FirebaseQuestions = Record<string,{
    author:{
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likes: Record<string,{
       authorId:string;
    }>
}>


export function useRoom(roomId: string){
    const { user } = useAuth();
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [title, setTile] = useState('');

    useEffect(()=>{
    
        const roomRef = database.ref(`rooms/${roomId}`);

        roomRef.on('value', room=>{
            const databaseRoom = room.val();
            const firebaseQuestions = databaseRoom.questions as FirebaseQuestions;

            const parseQuestions = Object.entries(firebaseQuestions ?? {}).map(([key, value])=>{
                return{
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes??{}).length,
                    likeId: Object.entries(value.likes??{}).find(([key, like]) => like.authorId === user?.id)?.[0],


                }
            })
            setTile(databaseRoom.title)
           setQuestions(parseQuestions)
        })
        return () =>{
            roomRef.off('value',);
        }
    },[roomId, user?.id]);

    return {questions, title}

} 

