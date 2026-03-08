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
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    linkedin: Optional[str] = None
    social_link: Optional[str] = None
    
    route_maps: List["RouteMap"] = Relationship(back_populates="user")
    progress: List["UserProgress"] = Relationship(back_populates="user")

class RouteMap(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    goal: str
    description: Optional[str] = None
    
    user: User = Relationship(back_populates="route_maps")
    nodes: List["Node"] = Relationship(back_populates="route_map")
    is_public: bool = Field(default=False)
    clones_count: int = Field(default=0)
    creator_username: Optional[str] = None
    root_map_id: Optional[int] = Field(default=None, foreign_key="routemap.id")

class NodeLink(SQLModel, table=True):
    parent_id: int = Field(foreign_key="node.id", primary_key=True)
    child_id: int = Field(foreign_key="node.id", primary_key=True)

class Node(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    route_map_id: int = Field(foreign_key="routemap.id")
    title: str
    description: Optional[str] = None
    level: int = 1  # For hierarchy
    x: Optional[float] = Field(default=None)
    y: Optional[float] = Field(default=None)
    is_expandable: bool = Field(default=True)
    has_expanded: bool = Field(default=False)
    is_collapsed: bool = Field(default=False)
    resources_json: Optional[str] = None
    
    route_map: RouteMap = Relationship(back_populates="nodes")
    user_progress: List["UserProgress"] = Relationship(back_populates="node")

class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    node_id: int = Field(foreign_key="node.id")
    is_completed: bool = Field(default=False)
    completed_resources_json: Optional[str] = Field(default="[]") # JSON list of completed resource URLs
    
    user: User = Relationship(back_populates="progress")
    node: Node = Relationship(back_populates="user_progress")

# Database connection
sqlite_file_name = "learning_advisor.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
