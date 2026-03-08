from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, create_engine, Session
import enum

class NodeStatus(str, enum.Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    COMPLETED = "completed"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password_hash: str
    
    route_maps: List["RouteMap"] = Relationship(back_populates="user")
    progress: List["UserProgress"] = Relationship(back_populates="user")

class RouteMap(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    goal: str
    description: Optional[str] = None
    
    user: User = Relationship(back_populates="route_maps")
    nodes: List["Node"] = Relationship(back_populates="route_map")

class Node(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    route_map_id: int = Field(foreign_key="routemap.id")
    title: str
    description: Optional[str] = None
    level: int = 1  # For hierarchy
    parent_id: Optional[int] = Field(default=None, foreign_key="node.id")
    
    route_map: RouteMap = Relationship(back_populates="nodes")
    # Using parent_id for DAG structure (or tree in simple cases)
    # Resources will be fetched on demand or cached here
    resources_json: Optional[str] = None # Store as JSON string for simplicity now
    
    user_progress: List["UserProgress"] = Relationship(back_populates="node")

class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    node_id: int = Field(foreign_key="node.id")
    is_completed: bool = Field(default=False)
    
    user: User = Relationship(back_populates="progress")
    node: Node = Relationship(back_populates="user_progress")

# Database connection
sqlite_file_name = "learning_advisor.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
