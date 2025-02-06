const game = {
  deck: [],
  playerHand: [],
  dealerHand: [],
  playerScore: 0,
  dealerScore: 0,
  gameOver: false,

  // Initialize the deck
  initDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let suit of suits) {
      for (let value of values) {
        this.deck.push({ suit, value });
      }
    }
    this.shuffleDeck();
  },

  // Shuffle the deck using Fisher-Yates algorithm
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  },

  // Deal a card from the deck
  dealCard() {
    if (this.deck.length > 0) {
      return this.deck.pop();
    } else {
      return null;
    }
  },

  // Calculate the score of a hand
  calculateScore(hand, dealerHand) {
    let score = 0;
    let hasAce = false;

    // Check for double Ace
    if (hand.length === 2 && hand[0].value === 'A' && hand[1].value === 'A') {
      if (dealerHand && dealerHand.length === 2 && dealerHand[0].value === 'A' && dealerHand[1].value === 'A') {
        return 'doubleAcePush';
      } else {
        return 'doubleAceWin';
      }
    }

    for (let card of hand) {
      let value = parseInt(card.value);
      if (isNaN(value)) {
        if (card.value === 'A') {
          if (hand.length === 2 && score <= 10) {
            value = 11;
          } else {
            value = 1;
          }
          hasAce = true;
        } else {
          value = 10;
        }
      }
      score += value;
    }

    return score;
  },

  // Display a card
  displayCard(card, target) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const topDiv = document.createElement('div');
    topDiv.classList.add('top');
    topDiv.innerText = `${card.value}
${this.getSuitSymbol(card.suit)}`;

    const bottomDiv = document.createElement('div');
    bottomDiv.classList.add('bottom');
    bottomDiv.innerText = `${card.value}
${this.getSuitSymbol(card.suit)}`;

    cardDiv.appendChild(topDiv);
    cardDiv.appendChild(bottomDiv);
    target.appendChild(cardDiv);
  },

  // Helper function to get suit symbol
  getSuitSymbol(suit) {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  },

  // Start a new game
  startGame() {
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.playerScore = 0;
    this.dealerScore = 0;
    this.gameOver = false;

    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('messages').innerText = '';

    // Create Hit and Stand buttons
    const hitButton = document.createElement('button');
    hitButton.id = 'hit-button';
    hitButton.innerText = 'Hit';
    const standButton = document.createElement('button');
    standButton.id = 'stand-button';
    standButton.innerText = 'Stand';
    const actionButtons = document.getElementById('action-buttons');
    actionButtons.innerHTML = ''; // Clear previous buttons
    actionButtons.appendChild(hitButton);
    actionButtons.appendChild(standButton);

    this.initDeck();

    // Deal initial hands
    this.playerHand.push(this.dealCard());
    this.playerHand.push(this.dealCard());
    this.dealerHand.push(this.dealCard());
    this.dealerHand.push(this.dealCard());

    // Check for double Ace and update score
    const playerScoreResult = this.calculateScore(this.playerHand, this.dealerHand);

    if (playerScoreResult === 'doubleAceWin') {
      this.endGame('Blackjack! You win!');
      return;
    } else if (playerScoreResult === 'doubleAcePush') {
      this.endGame('Push! Both players have double Aces.');
      return;
    } else {
      this.playerScore = playerScoreResult;
      this.dealerScore = this.calculateScore(this.dealerHand);
    }

    // Display cards
    for (let card of this.playerHand) {
      this.displayCard(card, document.getElementById('player-cards'));
    }
    this.displayCard(this.dealerHand[0], document.getElementById('dealer-cards')); // Show only one dealer card initially

    // Check for Blackjack
    if (this.playerScore === 21 && this.dealerScore === 21) {
      this.endGame('Push! Both players have Blackjack.');
    } else if (this.playerScore === 21) {
      this.endGame('Blackjack! You win!');
    } else if (this.dealerScore === 21) {
      this.endGame('Dealer Blackjack! You lose.');
    }

    this.attachButtonListeners(); // Reattach event listeners
  },

  // Player hits
  playerHit() {
    if (!this.gameOver) {
      const newCard = this.dealCard();
      this.playerHand.push(newCard);
      this.playerScore = this.calculateScore(this.playerHand);
      this.displayCard(newCard, document.getElementById('player-cards'));

      if (this.playerScore > 21) {
        this.endGame('You busted! You lose.');
        this.displayDealerCards();
      }
    }
  },

  // Player stands
  playerStand() {
    if (!this.gameOver) {
      if (this.playerScore < 16) {
        document.getElementById('messages').innerText = 'You must hit until your score is 16 or higher.';
      } else {
        this.gameOver = true;
        this.displayDealerCards();
        this.dealerPlay();
      }
    }
  },

  // Dealer's play
  dealerPlay() {
    document.getElementById('dealer-cards').innerHTML = ''; // Clear the hidden card
    for (let card of this.dealerHand) {
      this.displayCard(card, document.getElementById('dealer-cards'));
    }

    while (this.dealerScore < 17) {
      const newCard = this.dealCard();
      this.dealerHand.push(newCard);
      this.dealerScore = this.calculateScore(this.dealerHand);
      this.displayCard(newCard, document.getElementById('dealer-cards'));

      if (this.dealerScore > 21) {
        this.endGame('Dealer busted! You win!');
        return;
      }
    }

    this.determineWinner();
  },

  // Determine the winner
  determineWinner() {
    if (this.dealerScore > this.playerScore) {
      this.endGame('You lose!');
    } else if (this.dealerScore < this.playerScore) {
      this.endGame('You win!');
    } else {
      this.endGame('Push!');
    }
  },

  // End the game
  endGame(message) {
    this.gameOver = true;
    document.getElementById('messages').innerText = message;

    // Create New Game button
    const newGameButton = document.createElement('button');
    newGameButton.id = 'new-game-button';
    newGameButton.innerText = 'New Game';
    newGameButton.addEventListener('click', () => {
      this.startGame();
    });

    // Get references to action-buttons and messages
    const actionButtons = document.getElementById('action-buttons');

    // Remove action buttons
    actionButtons.innerHTML = '';
    actionButtons.appendChild(newGameButton);
  },

  // Attach button listeners
  attachButtonListeners() {
    document.getElementById('hit-button').addEventListener('click', () => {
      game.playerHit();
    });

    document.getElementById('stand-button').addEventListener('click', () => {
      game.playerStand();
    });
  }
};

// Initial event listeners
document.addEventListener('DOMContentLoaded', () => {
  game.startGame(); // Start a new game when the page loads
});
