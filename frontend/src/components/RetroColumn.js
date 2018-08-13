import React, { Component } from "react";
import PropTypes from "prop-types";
import { List, Card, Icon } from "antd";
import { Droppable, Draggable } from "react-beautiful-dnd";
import * as R from "ramda";

const IconText = ({ type, text }) => (
    <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
    </span>
);

class RetroColumn extends Component {
    handleAdd = e => {
        e.preventDefault();
        if (this.props.onNewCard) {
            this.props.onNewCard("New Card");
        }
    };

    render() {
        const { cards, title, colour, grid, cardWidth } = this.props;

        return (
            <div className="column">
                <div className="column-header">
                    <h3>{title}</h3>

                    <a className="column-action" onClick={this.handleAdd}>
                        <IconText type="plus-circle-o" text="Add Card" />
                    </a>
                </div>

                <Droppable droppableId={title}>
                    {(provided, snapshot) => (
                        <div
                            className="column-cards"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <List
                                footer={provided.placeholder}
                                grid={grid}
                                locale={{
                                    emptyText: "",
                                }}
                                dataSource={cards}
                                renderItem={item => (
                                    <Draggable
                                        key={`${title}-${item.id}`}
                                        draggableId={`${item.id}`}
                                        index={item.id}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                className="card"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <List.Item>
                                                    <Card
                                                        id={`card-${item.id}`}
                                                        data-message={
                                                            item.message
                                                        }
                                                        actions={[
                                                            <IconText
                                                                type="like-o"
                                                                text={R.sum(
                                                                    R.pluck(
                                                                        "count"
                                                                    )(
                                                                        item.votes
                                                                    )
                                                                )}
                                                            />,
                                                            <IconText
                                                                type="message"
                                                                text="0"
                                                            />,
                                                        ]}
                                                        style={{
                                                            width:
                                                                cardWidth ||
                                                                "100%",
                                                            backgroundColor: colour,
                                                        }}
                                                    >
                                                        <p>{item.message}</p>
                                                    </Card>
                                                </List.Item>
                                            </div>
                                        )}
                                    </Draggable>
                                )}
                            />
                        </div>
                    )}
                </Droppable>
            </div>
        );
    }
}

RetroColumn.propTypes = {
    title: PropTypes.string.isRequired,
    colour: PropTypes.string.isRequired,
    layout: PropTypes.string,
    cardWidth: PropTypes.number,
};

export default RetroColumn;
