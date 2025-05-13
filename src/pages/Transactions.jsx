import TransactionsIndex from "../components/transactions"

const TransactionsPage = ({user}) =>{
    return (
        <div>
            <TransactionsIndex user={user}/>
        </div>
    )
}

export default TransactionsPage