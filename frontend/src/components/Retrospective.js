import React from "react";
import { Query, compose, graphql } from "react-apollo";
import * as R from "ramda";

import Column from "./RetroColumn";
import { DragDropContext } from "react-beautiful-dnd";

import { GET_RETROSPECTIVE, ADD_CARD, MOVE_CARD } from "../queries";

const DEFAULT_BOARDS = ["Positive", "Mixed", "Negative"];

const DEFAULT_COLOURS = {
    Positive: "#bae637",
    Mixed: "#ffa940",
    Negative: "#ff4d4f",
};

class _Retrospective extends React.Component {
    getRetrospectiveId = () => {
        return R.path(["params", "id"], this.props.match);
    };

    handleAddCard = column => {
        return message => {
            const id = this.getRetrospectiveId();
            const newCard = { column, message };

            this.props.addCard({
                variables: {
                    id,
                    ...newCard,
                },
                optimisticResponse: {
                    __typename: "Mutation",
                    addCardToRetrospective: "pending-id",
                },
                update: (proxy, { data: { addCardToRetrospective } }) => {
                    const data = proxy.readQuery({
                        query: GET_RETROSPECTIVE,
                        variables: { id },
                    });

                    data.retrospectiveById.cards.push({
                        __typename: "Card",
                        id: addCardToRetrospective,
                        votes: [],
                        ...newCard,
                    });

                    proxy.writeQuery({
                        query: GET_RETROSPECTIVE,
                        variables: { id },
                        data,
                    });
                },
            });
        };
    };

    handleMoveCard = result => {
        const id = this.getRetrospectiveId();

        const { draggableId, destination } = result;
        if (!destination) {
            return;
        }

        const cardId = draggableId;
        const column = destination.droppableId;

        this.props.moveCard({
            variables: {
                id: cardId,
                column,
            },
            optimisticResponse: {
                __typename: "Mutation",
                moveCard: column,
            },
            update: (proxy, { data: { addCardToRetrospective } }) => {
                const data = proxy.readQuery({
                    query: GET_RETROSPECTIVE,
                    variables: { id },
                });
                const existingCards = data.retrospectiveById.cards;
                const targetCardIndex = R.findIndex(R.propEq("id", cardId))(
                    existingCards
                );
                existingCards[targetCardIndex].column = column;
                proxy.writeQuery({
                    query: GET_RETROSPECTIVE,
                    variables: { id },
                    data,
                });
            },
        });
    };

    getCards = columnName => {
        return R.pipe(
            R.pathOr([], ["retrospectiveById", "cards"]),
            R.filter(R.propEq("column", columnName))
        );
    };

    render() {
        const id = this.getRetrospectiveId();
        return (
            <Query query={GET_RETROSPECTIVE} variables={{ id }}>
                {({ loading, error, data }) => {
                    if (loading) {
                        return <h3>Preparing for Take-Off 🚀</h3>;
                    }

                    if (!R.prop(["retrospectiveById"], data)) {
                        return <h3>Rocketboard not found 💔</h3>;
                    }

                    return (
                        <div className="page-retrospective">
                            <DragDropContext onDragEnd={this.handleMoveCard}>
                                {DEFAULT_BOARDS.map(columnName => {
                                    return (
                                        <Column
                                            key={columnName}
                                            isLoading={loading}
                                            title={columnName}
                                            colour={DEFAULT_COLOURS[columnName]}
                                            onNewCard={this.handleAddCard(
                                                columnName
                                            )}
                                            cards={this.getCards(columnName)(
                                                data
                                            )}
                                        />
                                    );
                                })}
                            </DragDropContext>
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default compose(
    graphql(ADD_CARD, { name: "addCard" }),
    graphql(MOVE_CARD, { name: "moveCard" })
)(_Retrospective);
