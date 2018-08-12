package inmem

import (
	"github.com/arachnys/rocketboard/cmd/rocketboard/model"
	"github.com/pkg/errors"
)

type inmemRepository struct {
	retrosById             map[string]*model.Retrospective
	cardsById              map[string]*model.Card
	cardsByRetrospectiveId map[string][]*model.Card

	votesById     map[string]*model.Vote
	votesByCardId map[string][]*model.Vote
}

func NewRepository() *inmemRepository {
	return &inmemRepository{}
}

func (db *inmemRepository) NewRetrospective(r *model.Retrospective) error {
	if db.retrosById == nil {
		db.retrosById = make(map[string]*model.Retrospective)
	}

	db.retrosById[r.Id] = r
	return nil
}

func (db *inmemRepository) GetRetrospectiveById(id string) (*model.Retrospective, error) {
	r, ok := db.retrosById[id]
	if !ok {
		return nil, errors.Errorf("retrospective with ID `%s` does not exist", id)
	}

	return r, nil
}

func (db *inmemRepository) NewCard(c *model.Card) error {
	if db.cardsById == nil {
		db.cardsById = make(map[string]*model.Card)
	}
	if db.cardsByRetrospectiveId == nil {
		db.cardsByRetrospectiveId = make(map[string][]*model.Card)
	}

	db.cardsById[c.Id] = c
	db.cardsByRetrospectiveId[c.RetrospectiveId] = append(db.cardsByRetrospectiveId[c.RetrospectiveId], c)

	return nil
}

func (db *inmemRepository) MarkCardInProgress(id string) error {
	c := db.cardsById[id]
	c.Status = model.InProgress
	return nil
}

func (db *inmemRepository) MarkCardDiscussed(id string) error {
	c := db.cardsById[id]
	c.Status = model.Discussed
	return nil
}

func (db *inmemRepository) MarkCardArchived(id string) error {
	c := db.cardsById[id]
	c.Status = model.Archived
	return nil
}

func (db *inmemRepository) MoveCard(id string, column string) (*model.Card, error) {
	c := db.cardsById[id]
	c.Column = column
	return c, nil
}

func (db *inmemRepository) GetCardById(id string) (*model.Card, error) {
	c, ok := db.cardsById[id]
	if !ok {
		return nil, errors.Errorf("card with ID `%s` does not exist", id)
	}

	return c, nil
}

func (db *inmemRepository) GetCardsByRetrospectiveId(id string) ([]*model.Card, error) {
	cards, ok := db.cardsByRetrospectiveId[id]
	if !ok {
		return nil, errors.Errorf("card(s) with retrospective ID `%s` does not exist", id)
	}

	return cards, nil
}

func (db *inmemRepository) NewVote(v *model.Vote) error {
	if db.votesById == nil {
		db.votesById = make(map[string]*model.Vote)
	}
	if db.votesByCardId == nil {
		db.votesByCardId = make(map[string][]*model.Vote)
	}

	db.votesById[v.Id] = v
	db.votesByCardId[v.CardId] = append(db.votesByCardId[v.CardId], v)

	return nil
}

func (db *inmemRepository) GetVotesByCardId(id string) ([]*model.Vote, error) {
	votes, ok := db.votesByCardId[id]
	if !ok {
		return make([]*model.Vote, 0), nil
	}

	return votes, nil
}
